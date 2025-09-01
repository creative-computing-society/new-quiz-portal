package quiz

import (
	"errors"
	"log"
	"net/http"
	"sync"

	login "ccs.quizportal/Login"
	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

const shift int = 1 //later will make it central , time mapped

func GetQuizQuestions(c *gin.Context) ([]models.Quiz_Questions, error) {

	userID, err := login.GetUIDFromSession(c)
	if err != nil {
		return nil, err
	}

	var uq models.UserQuestions
	filter := bson.M{"userID": userID}
	err = db.User_Questions.Coll.FindOne(db.User_Questions.Context, filter).Decode(&uq)
	if err != nil {
		return nil, err
	}

	if uq.Shift != shift {
		return nil, errors.New("shift does not match")
	}

	return uq.Questions, nil
}

func RecieveResponse(c *gin.Context) {
	var resp models.Form_Responses
	if err := c.ShouldBindJSON(&resp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request "})
		return
	}

	userID, err := login.GetUIDFromSession(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter := bson.M{"userID": userID}
	count, err := db.Quiz_Responses.Coll.CountDocuments(db.Quiz_Responses.Context, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has already submitted responses"})
		return
	}
	count, err = db.Quiz_Track.Coll.CountDocuments(db.Quiz_Track.Context, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has already submitted responses"})
		return
	}
	dbEntry := models.QuizTrack{
		UserID:      userID,
		SnapShot:    resp.Image,
		FlagsRaised: resp.FlagsRaised,
		Marks:       0,
	}
	_, err = db.Quiz_Track.Coll.InsertOne(db.Quiz_Track.Context, dbEntry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store response"})
		return
	}
	dbResponses := models.Quiz_Responses{
		UserID:    userID,
		Responses: resp.Responses,
	}
	_, err = db.Quiz_Responses.Coll.InsertOne(db.Quiz_Responses.Context, dbResponses)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store response in Response Collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission Successful"})
}

func CalcScore() error {
	ctx := db.Quiz_Responses.Context

	ansCursor, err := db.Quiz_Answers.Coll.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer ansCursor.Close(ctx)

	answerMap := make(map[models.QID]models.OID)
	for ansCursor.Next(ctx) {
		var ans models.Quiz_Answer
		if err := ansCursor.Decode(&ans); err != nil {
			return err
		}
		answerMap[ans.QuestionID] = ans.Answer
	}

	respCursor, err := db.Quiz_Responses.Coll.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer respCursor.Close(ctx)

	jobs := make(chan models.Quiz_Responses, 100)
	var wg sync.WaitGroup

	workerCount := 10
	batchSize := 100

	for range workerCount {
		wg.Add(1)
		go func() {
			defer wg.Done()
			var batch []any

			flush := func() {
				if len(batch) == 0 {
					return
				}
				_, err := db.Quiz_Track.Coll.InsertMany(ctx, batch)
				if err != nil {
					log.Printf("InsertMany failed: %v", err)
				}
				batch = batch[:0]
			}

			for response := range jobs {
				score := 0
				for _, value := range response.Responses {
					if correctAns, ok := answerMap[value.QuestionID]; ok {
						if value.Answer == correctAns {
							score += 4
						} else {
							score -= 1
						}
					}
				}

				dbEntry := models.QuizTrack{
					UserID: response.UserID,
					Marks:  score,
				}
				batch = append(batch, dbEntry)

				if len(batch) >= batchSize {
					flush()
				}
			}
			flush()
		}()
	}

	for respCursor.Next(ctx) {
		var response models.Quiz_Responses
		if err := respCursor.Decode(&response); err != nil {
			return err
		}
		jobs <- response
	}
	close(jobs)

	wg.Wait()
	return nil
}
