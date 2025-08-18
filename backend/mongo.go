package main

import (
	"context"
	"errors"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Collection with Context for operations. One Stop Solution hai ye.
type Collection struct {
    Coll *mongo.Collection
    Context context.Context
  }

var (
	// Declaring DB
	DATABASE *mongo.Database

	//Declaring Collection to used in our portal
	AUTH Collection
	Registeration_Questions Collection
	Registeration_Responses Collection
	Quiz_Questions Collection
	Quiz_Responses Collection
	Quiz_Answers Collection
)

func Init() error{

	// Not complete yet. 
	
	ctx := context.Background()
	uri := os.Getenv("MONGOURI")

	if uri == ""{
		return errors.New("URI Set Nhi Hai")
	}

	client , err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return errors.New("DB.Init : mongo.Connect: " + err.Error())
	}

	if err = client.Ping(ctx, nil); err != nil {
    return errors.New("DB.Init: client.Ping\n" + err.Error())
  	}

	log.Println("Successfully Conected to Mongo....")

	DATABASE = client.Database("Recruitments_2025")


	Registeration_Questions  = Collection{DATABASE.Collection("reg_ques"), ctx}
	AUTH  = Collection{DATABASE.Collection("auth"), ctx}

	Registeration_Responses = Collection{DATABASE.Collection("reg_responses"), ctx}
	Quiz_Questions = Collection{DATABASE.Collection("quiz_ques"), ctx}
	Quiz_Responses = Collection{DATABASE.Collection("quiz_responses"), ctx}
	Quiz_Answers = Collection{DATABASE.Collection("quiz_answers"), ctx}
	return  nil

}

