package main

import (
	"log"
	"net/http"
	"os"

	login "ccs.quizportal/Login"
	registerationform "ccs.quizportal/Registeration_form"
	admin "ccs.quizportal/admin_portal"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/google"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system ENV")
	}

	if err := db.Init(); err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	clientCallbackURL := os.Getenv("CLIENT_CALLBACK_URL")

	if clientID == "" || clientSecret == "" || clientCallbackURL == "" {
		log.Fatal("env variables for oauth missing")
	}

	// set up oauth provider
	goth.UseProviders(
		google.New(clientID,clientSecret,clientCallbackURL),
	)

	admin.AdminUser = os.Getenv("ADMIN_USER")
	admin.AdminPasd = os.Getenv("ADMIN_PASS")

	// set up gin routre
	router := gin.Default()
	router.LoadHTMLGlob("admin_portal/templates/*")
	router.GET("/health", checkHealth)

	router.GET("/auth/google",login.HandleAuth)

	router.GET("/google_callback",login.HandleAuthCallback)

	router.GET("/regQuestions", registerationform.GetAllQues)
	router.POST("/register", registerationform.SubmitForm)

	router.GET("/admin", admin.ShowLogin)
	router.POST("/admin/login", admin.HandleLogin)

	authorized := router.Group("/admin", admin.AuthMiddleware)
	{
		authorized.GET("/home", admin.ShowHome)
		authorized.GET("/add-reg-question", admin.ShowAddRegQuestion)
		authorized.POST("/add-reg-question", admin.HandleAddRegQuestion)
	}

	// run on localhost:8080
	router.Run()
}

func checkHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Backend is up and running"})
}
