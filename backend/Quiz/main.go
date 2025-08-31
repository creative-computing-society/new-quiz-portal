package quiz

import (
	login "ccs.quizportal/Login"
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetQuizQuestions(c *gin.Context) ([]models.Quiz_Questions, error) {

	userID, err := login.GetUIDFromSession(c)
	if err != nil {
		return nil, err
	}

	var uq models.UserQuestions
	filter := bson.M{"userID": userID}
	err = db.User_Questions.Coll.FindOne(db.User_Questions.Context, filter).Decode(&uq)
	if err != nil {
		return nil, err
	}

	return uq.Questions, nil
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
