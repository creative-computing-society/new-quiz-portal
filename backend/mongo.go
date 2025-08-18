package main

import (
	"context"
	"errors"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Collection with Context for operations. One Stop Solution hai ye.
type Collection struct {
	Coll    *mongo.Collection
	Context context.Context
}

var (
	// Declaring DB
	DATABASE *mongo.Database

	//Declaring Collection to used in our portal
	AUTH                    Collection
	Registeration_Questions Collection
	Registeration_Responses Collection
	Quiz_Questions          Collection
	Quiz_Responses          Collection
	Quiz_Answers            Collection
)

func Init() error {

	// Not complete yet.

	ctx := context.Background()
	uri := os.Getenv("MONGOURI")

	if uri == "" {
		return errors.New("URI Set Nhi Hai")
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return errors.New("DB.Init : mongo.Connect: " + err.Error())
	}

	if err = client.Ping(ctx, nil); err != nil {
		return errors.New("DB.Init: client.Ping\n" + err.Error())
	}

	log.Println("Successfully Conected to Mongo....")

	DATABASE = client.Database("Recruitments_2025")

	Registeration_Questions = Collection{DATABASE.Collection("reg_ques"), ctx}
	AUTH = Collection{DATABASE.Collection("auth"), ctx}

	Registeration_Responses = Collection{DATABASE.Collection("reg_responses"), ctx}
	Quiz_Questions = Collection{DATABASE.Collection("quiz_ques"), ctx}
	Quiz_Responses = Collection{DATABASE.Collection("quiz_responses"), ctx}
	Quiz_Answers = Collection{DATABASE.Collection("quiz_answers"), ctx}

	return nil

}

func (db *Collection) sync(bsonM bson.M, entry any) error {
	result, err := db.Coll.ReplaceOne(db.Context, bsonM, entry)
	if err != nil {
		return errors.New("Error: DB.syncBson error\n" + err.Error())
	}

	if result.MatchedCount == 0 {
		return errors.New("Error: DB.syncBson failed, No document synced")
	}

	return nil
}

func (db *Collection) syncTryHard(bsonM bson.M, entry any, maxTries byte) error {
	var tries byte = 0

sync:
	if err := db.sync(bsonM, entry); err != nil {
		if tries > maxTries {
			return errors.New("DB.syncBsonTryHard: Error in DB.syncBson, Max Tries reached\n" + err.Error())
		}
		tries += 1
		goto sync
	}

	return nil
}

func (db *Collection) getExists(bsonM bson.M, out any) (bool, error) {
	result := db.Coll.FindOne(db.Context, bsonM)
	err := result.Err()

	if err == mongo.ErrNoDocuments {
		return false, nil
	} else if err != nil {
		return false, errors.New("getExistsBson: DB.FindOne error\n" + err.Error())
	}

	if out != nil {
		if err := result.Decode(out); err != nil {
			return false, errors.New("getExistsBson: result.Decode error\n" + err.Error())
		}
	}

	return true, nil
}

func (db *Collection) get(bsonM bson.M, out any) error {
	exists, err := db.getExists(bsonM, out)
	if !exists {
		return errors.New("DB.get: document does not exist")
	}
	return err
}

func (db *Collection) exists(bsonM bson.M) (bool, error) {
	return db.getExists(bsonM, nil)
}
