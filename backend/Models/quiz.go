package models

type Option struct {
	Value string `bson:"option_value"`
	Id    OID    `bson:"option_id"`
}

type Quiz_Questions struct {
	QuestionID QID      `bson:"questionID"`
	Question   string   `bson:"quizQuestions"`
	Options    []Option `bson:"options"`
	Image      string   `bson:"string"`
} // export to frontend

type Quiz_Answer struct {
	QuestionID QID `bson:"questionID"`
	Answer     OID `bson:"regAnswers"`
} // return from frontend and put in mongo
