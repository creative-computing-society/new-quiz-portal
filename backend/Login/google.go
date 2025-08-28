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

// func HandleAuth(c *gin.Context) {
// 	gothic.BeginAuthHandler(c.Writer, c.Request)
// }

func HandleAuth(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "google")
	c.Request.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func HandleAuthCallback(c *gin.Context) {
	jwtSecret := os.Getenv("JWT_SECRET")
	frontendRedirectUrl := os.Getenv("FRONTEND_REDIRECT_URL")

	if jwtSecret == "" || frontendRedirectUrl == "" {
		log.Fatal("env variables for oauth callback missing")
	}

	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	uid := GenerateUserUUID(user.Email)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(time.Hour * 12).Unix(),
	})

	signedToken, err := token.SignedString([]byte(jwtSecret))

	err1 := StoreAuthUser(user.Email, signedToken, uid)
	if err1 != nil {
		log.Fatal("UNABLE TO STORE USER")
	}

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	secure := false
	if gin.Mode() == gin.ReleaseMode {
		secure = true
	}

	c.SetCookie("session_token", signedToken, 3600*12, "/", "localhost", secure, true)

	c.Redirect(http.StatusTemporaryRedirect, frontendRedirectUrl)
}

func AuthMiddleware(c *gin.Context) {
	tokenStr, err := c.Cookie("session_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing session token"})
		c.Redirect(http.StatusFound, "/")
		return
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "JWT secret not set"})
		return
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			c.Redirect(http.StatusFound, "/")

			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session token"})
		c.Redirect(http.StatusFound, "/")
		return
	}

	c.Next()
}

func Logout(c *gin.Context) {
	c.SetCookie("session_token", "", -1, "/", "localhost", false, true)
	c.JSON(200, gin.H{"message": "Logged out"})
}
