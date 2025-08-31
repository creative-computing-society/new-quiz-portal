package main

import (
	"log"
	"net/http"
	"os"

	login "ccs.quizportal/Login"
	quiz "ccs.quizportal/Quiz"
	registerationform "ccs.quizportal/Registeration_form"
	admin "ccs.quizportal/admin_portal"
	"ccs.quizportal/db"
	"github.com/gin-contrib/cors"
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

	goth.UseProviders(
		google.New(clientID, clientSecret, clientCallbackURL),
	)

	admin.AdminUser = os.Getenv("ADMIN_USER")
	admin.AdminPasd = os.Getenv("ADMIN_PASS")
	FRONTEND_URL := os.Getenv("FRONTEND_URL")

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", FRONTEND_URL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	router.LoadHTMLGlob("admin_portal/templates/*")
	router.GET("/health", checkHealth)
	router.GET("/verify", login.Verify_token)
	router.GET("/checkRegistered", registerationform.CheckRegistered)

	router.GET("/auth/google", login.HandleAuth)

	router.GET("/google_callback", login.HandleAuthCallback)

	router.GET("/logout", login.Logout)
	router.GET("/admin", admin.ShowLogin)
	router.POST("/admin/login", admin.HandleLogin)

	authorized_admin := router.Group("/admin", admin.AuthMiddleware)
	{
		authorized_admin.GET("/home", admin.ShowHome)
		authorized_admin.GET("/add-reg-question", admin.ShowAddRegQuestion)
		authorized_admin.POST("/add-reg-question", admin.HandleAddRegQuestion)
		authorized_admin.GET("/add-quiz-question", admin.ShowAddQuizQuestion)
		authorized_admin.POST("/add-quiz-question", admin.AddQuizQuestion)
	}
	authorized_user := router.Group("/", login.AuthMiddleware)
	{
		authorized_user.GET("/regQuestions", registerationform.GetAllQues)
		authorized_user.POST("/register", registerationform.SubmitForm)
		authorized_user.GET("/quiz/get",quiz.GetQuizQues)
		authorized_user.POST("/quiz/submit",quiz.SubmitQuiz)
	}

	// run on localhost:8080
	// router.Run(":8080")
	router.Run("0.0.0.0:2117")
}

func checkHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Backend is up and running"})
}
