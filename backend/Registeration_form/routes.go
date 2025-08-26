package registerationform

import (
	"fmt"
	"log"
	"net/http"

	models "ccs.quizportal/Models"
	"github.com/gin-gonic/gin"
)

func SubmitForm(c *gin.Context) {
	// submit form
	var Resp models.RespUser
	err := c.ShouldBindJSON(&Resp)

	if err != nil {
		c.JSON(http.StatusBadRequest, "Could Not Parse Data")
		return
	}

	// save in db

	fmt.Println(Resp)

	c.JSON(http.StatusCreated, gin.H{"message": "Registeration Successful"})

}

func GetAllQues(c *gin.Context) {
	// get ques from mongo and send to frontend
	questions , err := GetRegQuestions()
	if(err!=nil){
		c.JSON(http.StatusInternalServerError , gin.H{"error":"Failed to fetch registeration questions , sad :/"})
		log.Fatal("reg ques nhi mile")
	}
	c.JSON(http.StatusOK,gin.H{"regQuestions":questions})
}
