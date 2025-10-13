package admin

// import (
// 	"net/http"

// 	models "ccs.quizportal/Models"
// 	"ccs.quizportal/db"
// 	"github.com/gin-gonic/gin"
// 	"go.mongodb.org/mongo-driver/bson"
// )

// func assignShift(c *g.Context) error {

// 	cursor_reg, err := db.Registeration_Responses.Coll.Find(db.Registeration_Responses.Context, bson.M{})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load registration questions"})
// 		return
// 	}
// 	defer cursor_reg.Close(db.Registeration_Responses.Context)

// 	for cursor_reg.Next(db.Registeration_Responses.Context) {
// 		var doc models.RegResponseDb

// 		if err := cursor_reg.Decode(&doc); err != nil {
// 			continue
// 		}

// 		dbEntry := models.UserQuestions{
// 			UserID: doc.UserID,
// 			Shift: ,
// 		}
// 	}

// }
