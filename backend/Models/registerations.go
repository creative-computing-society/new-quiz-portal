package models

type Question struct{
	QuestionID QID
	QuestionType bool
	Question string
} // export to frontend

type Answer struct{
	QuestionID QID
	QuestionType bool
	Answer string 
} // return from frontend and put in mongo
