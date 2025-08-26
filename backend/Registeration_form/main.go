package registerationform

import (
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"go.mongodb.org/mongo-driver/bson"
)

func GetRegQuestions() ([]models.Questions, error) {

	var questions []models.Questions
cursor, err := db.Registeration_Questions.Coll.Find(db.Registeration_Questions.Context, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(db.Registeration_Questions.Context)

	for cursor.Next(db.Registeration_Questions.Context) {
		var q models.Questions
		if err := cursor.Decode(&q); err != nil {
			return nil, err
		}

		questions = append(questions, q)

	}
	return questions, cursor.Err()
}
