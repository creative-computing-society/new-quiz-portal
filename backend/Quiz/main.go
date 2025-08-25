package quiz

import (
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"go.mongodb.org/mongo-driver/bson"
)

func getQuizQuestions() ([]models.Quiz_Questions, error) {

	var questions []models.Quiz_Questions
	cursor, err := db.Registeration_Questions.Coll.Find(db.Registeration_Questions.Context, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(db.Registeration_Questions.Context)

	for cursor.Next(db.Registeration_Questions.Context) {
		var q models.Quiz_Questions
		if err := cursor.Decode(&q); err != nil {
			return nil, err
		}

		questions = append(questions, q)

	}
	return questions, cursor.Err()
}

func getAnswers() ([]models.Quiz_Answer, error) {

	var answers []models.Quiz_Answer
	cursor, err := db.Registeration_Questions.Coll.Find(db.Registeration_Questions.Context, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(db.Registeration_Questions.Context)

	for cursor.Next(db.Registeration_Questions.Context) {
		var a models.Quiz_Answer
		if err := cursor.Decode(&a); err != nil {
			return nil, err
		}

		answers = append(answers, a)

	}
	return answers, cursor.Err()
}
