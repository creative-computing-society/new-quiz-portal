package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main(){
	// set up gin routre
	router := gin.Default()

	router.GET("/health",checkHealth)

	// run on localhost:8080
	router.Run()
}

func checkHealth(c *gin.Context){
	c.JSON(http.StatusOK , gin.H{"message":"Backend is up and running"})
}
