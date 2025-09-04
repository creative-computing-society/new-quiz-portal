import React, { useState, useEffect, useCallback, useRef } from "react";
import Question from "./Componenet/Question";
import Header from "./Componenet/Header";
import CustomWebcam from "./Componenet/camera";
import clockPicture from "./assets/Clock Circle.svg";
import { useNavigate } from "react-router-dom";

function subtractTime(date, hours, minutes) {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
}

const QuizPage = () => {
  const pageRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const navigate = useNavigate();

  const handleImageCapture = useCallback(
    async (base64Image) => {
      if (isVerifying) return;

      setIsVerifying(true);
      
      try {
        // Store the latest captured image for quiz submission
        setCapturedImage(base64Image);
        console.log("Image captured for proctoring");
        
      } catch (error) {
        console.warn("Failed to process captured image:", error);
      } finally {
        setIsVerifying(false);
      }
    },
    [isVerifying]
  );

  useEffect(() => {

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/quiz/get`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
    //     const data = [{
    //   "questionID": "q5",
    //   "questiontext": "How many rectangles are there in the figure shown?",
    //   "options": [
    //     {
    //       "option_value": "8",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "18",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "17",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "20",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": "https://i.postimg.cc/9XksXCLR/Q1.png",
    //   "shift": null
    // },
    // {
    //   "questionID": "q6",
    //   "questiontext": "Five cars (A, B, C, D, E) are colored red, blue, green, yellow, and black. The red car is not A or D. The blue car is neither C nor E. The green car is not B or C. The yellow car is not A, and the black car is not B. C is not the blue or green car. B is not the red or black car. Which car is black?",
    //   "options": [
    //     {
    //       "option_value": "A",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "B",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "C",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "D",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // },
    // {
    //   "questionID": "q7",
    //   "questiontext": "The committee’s recommendations were not considered __ because they lacked sufficient evidence and data.",
    //   "options": [
    //     {
    //       "option_value": "cogent",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "opulent",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "obsequious",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "salubrious",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // },
    // {
    //   "questionID": "q8",
    //   "questiontext": "Choose the most grammatically correct sentence from the following options.",
    //   "options": [
    //     {
    //       "option_value": "The data is compelling, but the findings is not.",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "The data are compelling, but the findings are not.",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "The data are compelling, but the findings is not.",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "The data is compelling, but the findings are not.",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // },
    // {
    //   "questionID": "q9",
    //   "questiontext": "What word in the English language becomes shorter when you add letters to it?",
    //   "options": [
    //     {
    //       "option_value": "short",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "pneumonoultramicroscopicsilicovolcanoconiosis",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "the",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "none of the above",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // },
    // {
    //   "questionID": "q10",
    //   "questiontext": "The project team leader __ the technical specifications on the table before the meeting.",
    //   "options": [
    //     {
    //       "option_value": "lie",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "lied",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "lay",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "laid",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // },
    // {
    //   "questionID": "q11",
    //   "questiontext": "Which of the following sentences is grammatically correct?",
    //   "options": [
    //     {
    //       "option_value": "Every man, woman and child are accounted for.",
    //       "option_id": "opt1"
    //     },
    //     {
    //       "option_value": "Every man, woman and child is accounted for.",
    //       "option_id": "opt2"
    //     },
    //     {
    //       "option_value": "Both of the above.",
    //       "option_id": "opt3"
    //     },
    //     {
    //       "option_value": "None of the above.",
    //       "option_id": "opt4"
    //     }
    //   ],
    //   "image_url": null,
    //   "shift": null
    // }];

        
        // Backend returns {questions: [...]} format according to swagger docs
        const transformedQuestions = data.questions.map((question, index) => {
          // Convert byte array questionID to hex string for frontend use
          const questionIdHex = question.questionID ? 
            Array.from(question.questionID).map(b => b.toString(16).padStart(2, '0')).join('') : 
            index.toString();
            
          return {
            _id: questionIdHex,
            question: question.questiontext,
            options: question.options.map(opt => opt.option_value),
            backendId: question.questionID, // Keep original byte array for submission
            backendOptions: question.options // Keep original options with byte array IDs
          };
        });
        
        setQuestions(transformedQuestions);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {

    const endTime = new Date();
    const adjustedEnd = subtractTime(endTime, 5, 30);
    const currentTime = new Date();
    const initialTimeRemaining = Math.floor(
      (adjustedEnd - currentTime) / 1000
    );
    setTimeRemaining(initialTimeRemaining);

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          if (!hasSubmitted) {
            handleSubmit();
            setHasSubmitted(true);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [hasSubmitted, handleImageCapture]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    try {

      // Transform answers to match backend expectations
      const responses = Object.entries(answers).map(([questionId, answerValue]) => {

        const question = questions.find(q => q._id.toString() === questionId);
        if (!question) return null;
        

        const selectedOption = question.backendOptions.find(opt => opt.value === answerValue);
        if (!selectedOption) return null;
        
        // Backend expects Quiz_Answer format with byte array IDs
        return {
          questionID: question.backendId, // Byte array format
          answer: selectedOption.id       // Byte array format for option ID
        };
      }).filter(Boolean);

      // Form_Responses structure according to swagger docs
      const submissionData = {
        image: capturedImage, // Use the latest captured image
        responses: responses,
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/quiz/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(submissionData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }
      
      const result = await response.json();
      console.log("Submission successful:", result);
      navigate("/submitted");
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Submission failed: ${error.message}`);
    }
  };

  const getQuestionStatus = (questionId) => {
    if (markedForReview[questionId]) return "review";
    if (answers[questionId]) return "attempted";
    return "unattempted";
  };

  const statusColors = {
    attempted: "bg-green-500",
    unattempted: "bg-gray-300",
    review: "bg-yellow-500",
  };

  const handleClear = (id) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[id];
      return newAnswers;
    });

    setMarkedForReview((prev) => {
      const newMarkedForReview = { ...prev };
      delete newMarkedForReview[id];
      return newMarkedForReview;
    });
  };

  const handleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div ref={pageRef}>
      <Header />
      <div className="flex min-h-screen bg-gray-100 pt-20 justify-end">
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-6 shadow-lg h-screen fixed left-0">
          <div className="mb-6 bg-[#F7F9FA] rounded-md flex gap-x-3 py-1 pl-2">
            <img
              src={clockPicture}
              alt="clock"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            <p className="text-2xl font-bold text-[#101828] w-max select-none">
              {formatTime(timeRemaining)}
            </p>
          </div>
          
          <div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full ${statusColors.attempted} mr-2`}
                ></div>
                <span>Attempted</span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full ${statusColors.unattempted} mr-2`}
                ></div>
                <span>Unattempted</span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full ${statusColors.review} mr-2`}
                ></div>
                <span>Mark For Review</span>
              </div>
            </div>
          </div>
          <div className="m-6">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    statusColors[getQuestionStatus(question._id)]
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="container">
              <CustomWebcam onImageCapture={handleImageCapture} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-3/4 p-6">
          <h1 className="text-3xl font-bold mb-6">Quiz Title</h1>
          {questions.map((question) => (
            <Question
              key={question._id}
              question={question}
              onAnswerChange={handleAnswerChange}
              onMarkForReview={() => handleMarkForReview(question._id)}
              isMarkedForReview={markedForReview[question._id] || false}
              onClear={handleClear}
            />
          ))}
          <button
            onClick={handleSubmit}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded duration-[250ms] hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
