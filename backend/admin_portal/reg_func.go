package admin

import (
	"crypto/rand"
	"log"
	"net/http"

	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
)

var validationRegexMap = map[string]string{
	"string":   ".*",
	"email":    `^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$`,
	"number":   `^\d+$`,
	"github":   `^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-]{1,39}\/?$`,
	"linkedin": `^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$`,
	"leetcode": `^(https?:\/\/)?(www\.)?leetcode\.com\/[A-Za-z0-9_-]{3,20}\/?$`,
	"link":     `^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-\.\?=%&]*)*\/?$`,
}

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
		c.SetCookie("admin_auth", "true", 3600, "/", "", true, true)
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
	validationType := c.PostForm("validation")
	regex, ok := validationRegexMap[validationType]
	if !ok {
		regex = ".*" // fallback to string
	}

	q := &models.Questions{
		Question:     question,
		QuestionType: qtype,
		Validation:   regex,
	}

	if err := AddRegQuestion(q, qtype); err != nil {
		c.HTML(http.StatusInternalServerError, "add_reg_question.html", gin.H{"Error": "Failed to add question"})
		return
	}

	c.HTML(http.StatusOK, "add_reg_question.html", gin.H{"Message": "Question added successfully"})
}
