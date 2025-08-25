package models

type Questions struct {
	QuestionID   QID    `bson:"questionID"`
	QuestionType bool   `bson:"questionType"`
	Question     string `bson:"regQuestions"`
} // export to frontend

type Answer struct {
	QuestionID   QID    `bson:"questionID"`
	QuestionType bool   `bson:"questionType"`
	Answer       string `bson:"regAnswers"`
} // return from frontend and put in mongo
