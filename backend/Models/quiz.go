package models

import "time"

type Option struct {
	Value string `bson:"option_value"`
	Id    OID    `bson:"option_id"`
}

type Quiz_Questions struct {
	QuestionID QID      `bson:"questionID" binding:"required"`
	Question   string   `bson:"quizQuestions" binding:"required"`
	Options    []Option `bson:"options" binding:"required"`
	Image      string   `bson:"image_url" ` //Optional hai per question //cloudinary link
	Shift      int      `bson:"shift" binding:"required"`
} //export to frontend hoga ye
type Quiz_Answer struct {
	QuestionID QID `bson:"questionID" binding:"required"`
	Answer     OID `bson:"quizAnswers" binding:"required"`
}

type QuizTrack struct {
	UserID      UID    `bson:"userID"`
	SnapShot    string `bson:"SnapshotLink"`
	Marks       int    `bson:"marks"`
	FlagsRaised int    `bson:"flagsraised"`
}

type Quiz_Responses struct {
	UserID    UID           `bson:"userID"`
	Responses []Quiz_Answer `bson:"quiz_responses"`
}

type Form_Responses struct {
	Image       string        `bson:"snapshot" binding:"required"`
	Responses   []Quiz_Answer `bson:"quiz_responses" binding:"required,dive,required"`
	FlagsRaised int           `bson:"flagsRaised" binding:"required"`
}

type UserQuestions struct {
	UserID    UID              `bson:"userID" binding:"required"`
	Shift     int              `bson:"shift" binding:"required"`
	Questions []Quiz_Questions `bson:"questions" binding:"required"`
}

type Updates struct {
	UserID    UID  `bson:"userID" binding:"required"`
	Started   bool `bson:"quiz_started" binding:"required"`
	Submitted bool `bson:"quiz_submitted" binding:"required"`
}

type Shift struct {
	Shift int       `bson:"shift" json:"shift" binding:"required"`
	Date  time.Time `bson:"date"  json:"date"  binding:"required"`
	Start time.Time `bson:"start_time" json:"start_time" binding:"required"`
}
