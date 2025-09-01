package quiz

import (
	"log"
	"sync"

	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"go.mongodb.org/mongo-driver/bson"
)

func CalcScore() error {
	ctx := db.Quiz_Responses.Context
	log.Println("CALL TOH MERI MAA BHI HUI THI")

	ansCursor, err := db.Quiz_Answers.Coll.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer ansCursor.Close(ctx)
	log.Println("CALL TOH MERI MAA BHI HUI THI...FIR USKI BEHEN BHI HUI THI")

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
				log.Println("MAA INSERT HOGYI")
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
					Marks:  100,
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
