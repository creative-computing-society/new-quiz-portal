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
  const [flagsRaised, setFlagsRaised] = useState(0);
  const [capturedImage, setCapturedImage] = useState("");
  const navigate = useNavigate();

  function sendCheatAttemptRequest() {
    // Increment flags raised instead of making API call
    setFlagsRaised(prev => prev + 1);
    console.log("Cheat attempt detected, flags raised:", flagsRaised + 1);
  }

  const handleKeyDown = useCallback(
    (e) => {


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
        alert(`Warning: Unauthorized action detected! Total warnings: ${flagsRaised + 1}`);
      }


    },
    [] // Removed unnecessary dependency
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
        
        // Backend returns {questions: [...]} format according to swagger docs
        const transformedQuestions = data.questions.map((question, index) => {
          // Convert byte array questionID to hex string for frontend use
          const questionIdHex = question.questionID ? 
            Array.from(question.questionID).map(b => b.toString(16).padStart(2, '0')).join('') : 
            index.toString();
            
          return {
            _id: questionIdHex,
            question: question.question,
            options: question.options.map(opt => opt.value),
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
              handleSubmit();
              setHasSubmitted(true);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
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
        flagsRaised: flagsRaised // Use the accumulated flags
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
          
          {/* Flags Raised Indicator */}
          {flagsRaised > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-md">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ Warnings: {flagsRaised}
              </p>
            </div>
          )}
          
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
