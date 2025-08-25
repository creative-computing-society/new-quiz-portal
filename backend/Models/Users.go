package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type (
	UID *string
	QID *string
	SID *jwt.Token
)

type AuthUser struct {
	UserId       UID    `bson:"userID"`
	Email        string `bson:"userEmail"`
	SessionToken SID    `bson:"sessionToken"`
}

type RespUser struct {
	UserID     UID      `bson:"userID"`
	RegAnswers []Answer `bson:"answers"`
}
