package registerationform

import (
	"errors"
	"regexp"

	models "ccs.quizportal/Models"
)

// ValidateAnswers checks each answer against its question's regex
func ValidateAnswers(answers []models.Answer, questions []models.Questions) error {
	questionMap := make(map[models.QID]models.Questions)
	for _, q := range questions {
		questionMap[q.QuestionID] = q
	}
	for _, ans := range answers {
		q, ok := questionMap[ans.QuestionID]
		if !ok {
			return errors.New("invalid question")
		}
		if q.Validation != "" {
			matched, _ := regexp.MatchString(q.Validation, ans.Answer)
			if !matched {
				return errors.New("answer for question '" + q.Question + "' does not match validation")
			}
		}
	}
	return nil
}
