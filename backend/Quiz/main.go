package quiz

import (
	"encoding/hex"
	"errors"
	"log"
	"net/http"
	"time"

	login "ccs.quizportal/Login"
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// const shift int = 1 //later will make it central , time mapped

var (
	shiftsMap     map[int]models.Shift
	errLoadShifts error
)

func init() {
	shiftsMap, errLoadShifts = LoadAllShifts()
}

func GetQuizQuestions(c *gin.Context) ([]models.Quiz_Questions, error) {
	if errLoadShifts != nil {
		return nil, errors.New("could not load shift timings")
	}
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

	userShift := uq.Shift
	shiftInfo, ok := shiftsMap[userShift]
	if !ok {
		return nil, errors.New("shift info not found")
	}
	now := time.Now().In(shiftInfo.Start.Location())
	if now.Before(shiftInfo.Start) {
		return nil, errors.New("quiz not started for your shift yet")
	}

	dbEntry := models.Updates{
		UserID:    userID,
		Started:   true,
		Submitted: false,
	}

	_, err = db.Updates.Coll.UpdateOne(
		db.Updates.Context,
		bson.M{"userID": userID},
		bson.M{"$setOnInsert": dbEntry},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		log.Printf("Failed to insert/update started flag for user %v: %v", userID, err)
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var uq models.UserQuestions
	filter := bson.M{"userID": userID}
	err = db.User_Questions.Coll.FindOne(db.User_Questions.Context, filter).Decode(&uq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user questions"})
		return
	}

	assignedQIDs := make(map[string]bool)
	for _, q := range uq.Questions {
		if q.QuestionID != nil {
			assignedQIDs[hex.EncodeToString(q.QuestionID[:])] = true
		}
	}

	for _, ans := range resp.Responses {
		if ans.QuestionID == nil || !assignedQIDs[hex.EncodeToString(ans.QuestionID[:])] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer for unassigned question"})
			return
		}
	}

	dbResponses := models.Quiz_Responses{
		UserID:    userID,
		Responses: resp.Responses,
	}

	_, err = db.Quiz_Responses.Coll.UpdateOne(
		db.Quiz_Responses.Context,
		bson.M{"userID": userID},
		bson.M{"$setOnInsert": dbResponses},
		options.Update().SetUpsert(true),
	)
	if writeErr, ok := err.(mongo.WriteException); ok && writeErr.HasErrorCode(11000) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has already submitted"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store responses"})
		return
	}

	dbEntry := models.QuizTrack{
		UserID:      userID,
		SnapShot:    resp.Image,
		FlagsRaised: resp.FlagsRaised,
		Marks:       0,
	}

	_, err = db.Quiz_Track.Coll.UpdateOne(
		db.Quiz_Track.Context,
		bson.M{"userID": userID},
		bson.M{"$setOnInsert": dbEntry},
		options.Update().SetUpsert(true),
	)
	if writeErr, ok := err.(mongo.WriteException); ok && writeErr.HasErrorCode(11000) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has already submitted"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store quiz track"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission Successful"})

	go func(userID models.UID) {
		filter := bson.M{"userID": userID, "quiz_started": true}
		update := bson.M{"$set": bson.M{"quiz_submitted": true}}

		_, err := db.Updates.Coll.UpdateOne(db.Updates.Context, filter, update)
		if err != nil {
			log.Printf("failed to update submitted flag for user %v: %v", userID, err)
		}
	}(userID)
}
