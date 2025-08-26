package admin

import (
	"crypto/rand"
	"log"
	"net/http"

	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
)

func GenerateQID() models.QID {
	var id [7]byte
	_, err := rand.Read(id[:])
	if err != nil {
		panic("failed to generate QID")
	}
	return &id
}

func AddRegQuestion(q *models.Questions, questiontype bool) error {

	if q.QuestionID == nil {
		q.QuestionID = GenerateQID()
	}
	_, err := db.Registeration_Questions.Coll.InsertOne(db.Registeration_Questions.Context, q)
	return err

}

var (
	AdminUser string
	AdminPasd string
)

func AuthMiddleware(c *gin.Context) {
	log.Println("1")
	auth, err := c.Cookie("admin_auth")
	if err != nil || auth != "true" {
		c.Redirect(http.StatusFound, "/admin")
		c.Abort()
		return
	}
	log.Println("2")

	c.Next()
}

func ShowHome(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", nil)
}

func ShowLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func HandleLogin(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	log.Println("Submitted:", username, password)
	log.Println("Expected:", AdminUser, AdminPasd)

	if username == AdminUser && password == AdminPasd {
		c.SetCookie("admin_auth", "true", 3600, "/", "", false, true)
		c.Redirect(http.StatusFound, "/admin/home")
		return
	}
	c.HTML(http.StatusUnauthorized, "login.html", gin.H{"Error": "Invalid credentials"})
}

func ShowAddRegQuestion(c *gin.Context) {
	c.HTML(http.StatusOK, "add_reg_question.html", nil)
}

func HandleAddRegQuestion(c *gin.Context) {
	question := c.PostForm("question")
	qtype := c.PostForm("questiontype") == "true"

	q := &models.Questions{
		Question:     question,
		QuestionType: qtype,
	}

	if err := AddRegQuestion(q, qtype); err != nil {
		c.HTML(http.StatusInternalServerError, "add_reg_question.html", gin.H{"Error": "Failed to add question"})
		return
	}

	c.HTML(http.StatusOK, "add_reg_question.html", gin.H{"Message": "Question added successfully"})
}
