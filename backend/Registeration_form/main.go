package registerationform

import (
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"go.mongodb.org/mongo-driver/bson"
)

func getQuestions() ([]models.Question, error) {

	var questions []models.Question
	cursor, err := db.Registeration_Questions.Coll.Find(db.Registeration_Questions.Context, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(db.Registeration_Questions.Context)

	for cursor.Next(db.Registeration_Questions.Context) {
		var q models.Question
		if err := cursor.Decode(&q); err != nil {
			return nil, err
		}

		questions = append(questions, q)

	}
	return questions, cursor.Err()
}

func getAnswers() ([]models.Answer, error) {

	var answers []models.Answer
	cursor, err := db.Registeration_Questions.Coll.Find(db.Registeration_Questions.Context, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(db.Registeration_Questions.Context)

	for cursor.Next(db.Registeration_Questions.Context) {
		var a models.Answer
		if err := cursor.Decode(&a); err != nil {
			return nil, err
		}

		answers = append(answers, a)

	}
	return answers, cursor.Err()
}
