import React, { useState, useEffect, useCallback, useRef } from "react";
import Question from "./Componenet/Question";
import Header from "./Componenet/Header";
import CustomWebcam from "./Componenet/camera";
import clockPicture from "./assets/Clock Circle.svg";
import { useNavigate } from "react-router-dom";
import { imagewithoutLandmark } from "./Componenet/draw";

function subtractTime(date, hours, minutes) {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
}

const QuizPage = () => {
  const pageRef = useRef(null);
  const [isKeyboardDisabled, setIsKeyboardDisabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if auto-submit has been triggered
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));

  async function sendCheatAttemptRequest() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/users/cheatAttempt`,
        {
          headers: {
            Authorization: `${localStorage.getItem("jwt")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Cheat attempt reported successfully");
    } catch (error) {
      // console.error('Error reporting cheat attempt:', error);
    }
  }

  const handleKeyDown = useCallback(
    (e) => {
      // if (isKeyboardDisabled) {
      //   e.preventDefault();
      if (
        e.key === "Escape" ||
        e.key === "F11" ||
        e.key === "F12" ||
        e.key === "Meta" ||
        e.key === "Alt" ||
        e.key === "Control" ||
        e.key === "c" ||
        e.key === "x" ||
        e.key === "v" ||
        e.key === "r" ||
        e.key === "Shift" ||
        e.key === "Tab"
      ) {
        sendCheatAttemptRequest();
        alert("Warning: Do not even Try");
      }
      //   // ... handle other keys ...
      // }
    },
    [isKeyboardDisabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleImageCapture = useCallback(
    async (base64Image) => {
      if (isVerifying) return; // Prevent multiple simultaneous verifications

      setIsVerifying(true);
      // try {
      //   const response = await fetch(
      //     `${process.env.REACT_APP_MLMODEL}/api/verify/`,
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ roll: userData.rollNo, image: imagewithoutLandmark }),
      //     }
      //   );

      //   if (!response.ok) {
      //     throw new Error("Verification failed");
      //   }

      //   const data = await response.json();
      //   if (data.verified) {
      //     const response = await fetch(
      //       `${process.env.REACT_APP_BACKEND}/api/v1/users/cheatAttempt`,
      //       {
      //         credentials: "include",
      //         headers: {
      //           Authorization: `${localStorage.getItem("jwt")}`,
      //         },
      //       }
      //     );
      //   } else {
      //     // console.log("Verification failed");
      //     // Handle failed verification (e.g., end exam, show warning)
      //   }
      // } catch (error) {
      //   console.error("Error during verification:", error);
      // } finally {
      //   setIsVerifying(false);
      // }
    },
    [isVerifying]
  );

  useEffect(() => {
    // Fetch questions from the API
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/questions/getQuestions`,
          {
            credentials: "include",
            headers: {
              Authorization: `${localStorage.getItem("jwt")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setQuestions(data.data.questions);
      } catch (error) {
        // console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    // Get endTime from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.endTime) {
      const endTime = new Date(userData.endTime);
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
              handleSubmit(); // Trigger auto-submit
              setHasSubmitted(true); // Ensure auto-submit happens only once
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasSubmitted, handleImageCapture]); // Dependency array to trigger effect only if `hasSubmitted` changes

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
      const userdata = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/answers/checkAnswers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("jwt")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            questionIdsAndAnswers: answers, // ensure 'answers' matches the format required
          }),
        }
      );
      navigate("/submitted");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data["status"] === "success") {
        setErrorMessage("");
        navigate("/submitted");
      } else if (data["status"] === "failed") {
        setErrorMessage(data["err"]);
      }
    } catch (error) {
      // console.error("Error submitting answers:", error);
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
          {errorMessage && (
            <p className="text-red-600 mt-4 bg-red-100 p-3 select-none w-full">
              {errorMessage}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
