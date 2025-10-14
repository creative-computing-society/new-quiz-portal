package admin

import (
	"fmt"
	"math/rand"
	"net/http"
	"sort"
	"time"

	models "ccs.quizportal/Models"
	"ccs.quizportal/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func shuffleQuestions(qs []models.Quiz_Questions) {
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(qs), func(i, j int) { qs[i], qs[j] = qs[j], qs[i] })
}

func StringToUID(s string) models.UID {
	var arr [7]byte
	copy(arr[:], []byte(s))
	return &arr
}

func AssignShiftsAndQuestions(c *gin.Context) {

	var req struct {
		NumShifts       int `json:"num_shifts"`
		QuestionsPerSet int `json:"questions_per_set"`
	}

	// body, _ := io.ReadAll(c.Request.Body)
	// log.Println("Received body:", string(body))
	// c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
	if err := c.ShouldBindJSON(&req); err != nil || req.NumShifts < 1 || req.QuestionsPerSet < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "num_shifts and questions_per_set required"})
		return
	}

	fmt.Printf("num_shifts=%d, questions_per_set=%d\n", req.NumShifts, req.QuestionsPerSet)
	// log.Println(1)

	cursor, err := db.Registeration_Responses.Coll.Find(db.Registeration_Responses.Context, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load registrations"})
		return
	}
	defer cursor.Close(db.Registeration_Responses.Context)

	// log.Println(2)
	type RegDoc struct {
		UserID any `bson:"userID"`
	}
	var userIDs []string
	for cursor.Next(db.Registeration_Responses.Context) {
		var doc RegDoc
		if err := cursor.Decode(&doc); err == nil {
			switch v := doc.UserID.(type) {
			case []byte:
				userIDs = append(userIDs, string(v))
			case string:
				userIDs = append(userIDs, v)
			case primitive.Binary:
				userIDs = append(userIDs, string(v.Data))
			default:
				fmt.Printf("Unknown userID type: %T\n", v)
			}
		}
	}
	// log.Println(3)
	if len(userIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No registered users found"})
		return
	}
	sort.Strings(userIDs)

	var questions []models.Quiz_Questions
	qCursor, err := db.Quiz_Questions.Coll.Find(db.Quiz_Questions.Context, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load quiz questions"})
		return
	}
	defer qCursor.Close(db.Quiz_Questions.Context)
	for qCursor.Next(db.Quiz_Questions.Context) {
		var q models.Quiz_Questions
		if err := qCursor.Decode(&q); err == nil {
			questions = append(questions, q)
		}
	}
	if len(questions) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No quiz questions found"})
		return
	}

	created, skipped := 0, 0
	for idx, uid := range userIDs {
		shift := (idx % req.NumShifts) + 1
		binaryUID := StringToUID(uid)
		count, err := db.User_Questions.Coll.CountDocuments(
			db.User_Questions.Context,
			bson.M{"userID": binaryUID},
		)
		if err != nil {
			continue
		}
		if count > 0 {
			skipped++
			continue
		}

		if req.QuestionsPerSet > len(questions) {
			req.QuestionsPerSet = len(questions)
		}
		userQs := make([]models.Quiz_Questions, len(questions))
		copy(userQs, questions)
		shuffleQuestions(userQs)
		userQs = userQs[:req.QuestionsPerSet]

		entry := models.UserQuestions{
			UserID:    StringToUID(uid),
			Shift:     shift,
			Questions: userQs,
		}
		_, err = db.User_Questions.Coll.InsertOne(db.User_Questions.Context, entry)
		if err == nil {
			created++
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"message":          "Shifts and questions assigned",
		"users_processed":  len(userIDs),
		"created":          created,
		"skipped_existing": skipped,
		"num_shifts":       req.NumShifts,
	})
}
