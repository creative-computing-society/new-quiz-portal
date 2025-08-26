package login

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth/gothic"
)

func HandleAuth(c *gin.Context) {
		gothic.BeginAuthHandler(c.Writer, c.Request)
}

func HandleAuthCallback (c *gin.Context) {
	jwtSecret := os.Getenv("JWT_SECRET")
	frontendRedirectUrl := os.Getenv("FRONTEND_REDIRECT_URL")

		if jwtSecret == "" || frontendRedirectUrl == ""  {
		log.Fatal("env variables for oauth callback missing")
	}


		user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256,jwt.MapClaims{
			"email":user.Email,
			"name":user.Name,
			"exp":time.Now().Add(time.Hour*12).Unix(),
		})

		signedToken,err := token.SignedString([]byte(jwtSecret))

		if err != nil {
        c.AbortWithError(http.StatusInternalServerError, err)
        return
    }

	secure:=false
	if(gin.Mode() == gin.ReleaseMode){
		secure = true
	}

	c.SetCookie("quiz_jwt_token",signedToken,3600*12,"/","localhost",secure,true)

		c.Redirect(http.StatusTemporaryRedirect, frontendRedirectUrl)
	}