package quiz

import (
	"errors"
	"net/http"

	login "ccs.quizportal/Login"
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

const shift int = 1 //later will make it central , time mapped

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

	if uq.Shift != shift {
		return nil, errors.New("shift does not match")
	}

	return uq.Questions, nil
}

func RecieveResponse(c *gin.Context) {
	var resp models.Form_Responses
	if err := c.ShouldBindJSON(&resp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userID, err := login.GetUIDFromSession(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	db_Entry := models.QuizTrack{
		UserID:      userID,
		SnapShot:    resp.Image,
		FlagsRaised: resp.FlagsRaised,
		Marks:       0,
	}

	_, err = db.Quiz_Track.Coll.InsertOne(db.Quiz_Track.Context, db_Entry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store response"})
		return
	}

	dbResponses := models.Quiz_Responses{
		UserID:    userID,
		Responses: resp.Responses,
	}

	_, err = db.Quiz_Responses.Coll.InsertOne(db.Quiz_Responses.Context, dbResponses)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store response in Response Collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission Successfull"})
}
