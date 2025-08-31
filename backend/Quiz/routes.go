package quiz

import (
	"net/http"

	models "ccs.quizportal/Models"
	"github.com/gin-gonic/gin"
)

// @Summary      Submit quiz response
// @Description  User submits answers
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        request  body      models.Form_Responses  true  "Quiz Response"
// @Success      200      {object}  map[string]string "Success message"
// @Failure      400      {object}  map[string]string "Invalid request"
// @Failure      500      {object}  map[string]string "Internal server error"
// @Router       /quiz/submit [post]
func SubmitQuiz(c *gin.Context) {
	var Resp models.Form_Responses
	err := c.ShouldBindJSON(&Resp)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Request"})
		return
	}

	RecieveResponse(c)
}


// @Summary      Get quiz Questions
// @Description  Send questions for each user to the frontend
// @Tags         quiz
// @Produce      json
// @Success      200      {object}  map[string][]models.Quiz_Questions
// @Failure      500      {object}  map[string]string
// @Router       /quiz/get [get]
func GetQuizQues(c *gin.Context) {

	questions, err := GetQuizQuestions(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
	}
	c.JSON(http.StatusOK, gin.H{"questions": questions})
}
