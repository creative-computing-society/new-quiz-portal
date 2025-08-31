package quiz

import (
	"net/http"

	models "ccs.quizportal/Models"
	"github.com/gin-gonic/gin"
)

func SubmitQuiz(c *gin.Context) {
	var Resp models.Form_Responses
	err := c.ShouldBindJSON(&Resp)

	if err != nil {
		c.JSON(http.StatusBadRequest, "Invalid Request")
		return
	}

	RecieveResponse(c)
}

func GetQuizQues(c *gin.Context) {

	questions, err := GetQuizQuestions(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err})
	}
	c.JSON(http.StatusOK, gin.H{"questions": questions})
}
