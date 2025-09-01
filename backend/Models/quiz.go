package models

type Option struct {
	Value string `bson:"option_value"`
	Id    OID    `bson:"option_id"`
}

type Quiz_Questions struct {
	QuestionID QID      `bson:"questionID"`
	Question   string   `bson:"quizQuestions"`
	Options    []Option `bson:"options"`
	Image      string   `bson:"image_url"` //Optional hai per question //cloudinary link
	Shift      int      `bson:"shift"`
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
	UserID    UID              `bson:"userID"`
	Shift     int              `bson:"shift"`
	Questions []Quiz_Questions `bson:"questions"`
}
