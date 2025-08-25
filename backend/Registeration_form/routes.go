package registerationform

import (
	"fmt"
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
}
