package main

import (
	"net/http"

	registerationform "ccs.quizportal/Registeration_form"
	"github.com/gin-gonic/gin"
)

func main(){
	

	// set up gin routre
	router := gin.Default()

	router.GET("/health",checkHealth)

	router.GET("/getQuestions",registerationform.GetAllQues)
	router.POST("/register",registerationform.SubmitForm)

	// run on localhost:8080
	router.Run()
}

func checkHealth(c *gin.Context){
	c.JSON(http.StatusOK , gin.H{"message":"Backend is up and running"})
}
