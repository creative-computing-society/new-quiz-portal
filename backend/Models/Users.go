package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type (
	UID *string
	QID *string
) 


type AuthUser struct{
    UserId UID
	Email string
	SessionToken *jwt.Token
}



type RespUser struct{
	UserID UID
	RegAnswers []Answer
}





