package registerationform

import (
	"log"
	"net/http"

	login "ccs.quizportal/Login"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func SubmitForm(c *gin.Context) {
	StoreRegResponse(c)
}

func GetAllQues(c *gin.Context) {
	// get ques from mongo and send to frontend
	questions, err := GetRegQuestions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch registeration questions , sad :/"})
		log.Fatal("reg ques nhi mile")
	}
	c.JSON(http.StatusOK, gin.H{"regQuestions": questions})
}

func CheckRegistered(c *gin.Context) {
	uid, err := login.GetUIDFromSession(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	filter := bson.M{"userID": uid}
	count, err := db.Registeration_Responses.Coll.CountDocuments(db.Registeration_Responses.Context, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusOK, gin.H{"registered": true})
	} else {
		c.JSON(http.StatusOK, gin.H{"registered": false})
	}
}
