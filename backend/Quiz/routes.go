package quiz

import (
	"net/http"

	models "ccs.quizportal/Models"
	"github.com/gin-gonic/gin"
)

func SubmitQuiz(c *gin.Context) {
	// submit form
	var Resp models.Form_Responses
	err := c.ShouldBindJSON(&Resp)

	if err != nil {
		c.JSON(http.StatusBadRequest, "Could Not Parse Data")
		return
	}

	

	// save in db


	c.JSON(http.StatusCreated, gin.H{"message": "Submission Successful"})

}

func GetQuizQues(c *gin.Context)  {
	// get ques from mongo and send to frontend
	
	questions , err := GetQuizQuestions(c)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"message":"Could not fetch questions"})
	}
	c.JSON(http.StatusOK , gin.H{"questions":questions})
}
