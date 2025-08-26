package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type (
	UID *[7]byte
	QID *[7]byte
	SID *jwt.Token
	OID *[7]byte
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
