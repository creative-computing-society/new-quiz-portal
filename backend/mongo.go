package main

import (
	"context"
	"errors"
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
	DATABSE *mongo.Database

	//Declaring Collection to used in our portal
	QuestionDB Collection
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

	

	// return  nil

}