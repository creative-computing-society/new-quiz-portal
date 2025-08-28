package registerationform

import (
	"encoding/hex"
	"errors"
	"regexp"

	models "ccs.quizportal/Models"
)

func qidToString(qid models.QID) string {
	if qid == nil {
		return ""
	}
	return hex.EncodeToString(qid[:])
}

func ValidateAnswers(answers []models.Answer, questions []models.Questions) error {
	questionMap := make(map[string]models.Questions)
	for _, q := range questions {
		questionMap[qidToString(q.QuestionID)] = q
	}
	for _, ans := range answers {
		q, ok := questionMap[qidToString(ans.QuestionID)]
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
