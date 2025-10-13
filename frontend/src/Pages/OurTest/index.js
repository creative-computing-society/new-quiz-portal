import React, { useState, useEffect, useCallback, useRef } from "react";
import Question from "./Componenet/Question";
import Header from "./Componenet/Header";
import CustomWebcam from "./Componenet/camera";
import clockPicture from "./assets/Clock Circle.svg";
import { useNavigate } from "react-router-dom";
import config from '../../config';

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
  const [shift, setShift] = useState(1);
  const [flags, setFlags] = useState(0);
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
    const endTime = subtractTime(new Date(shift == 1 ? config.slot1_time : config.slot2_time), 0, -10);
    const currentTime = new Date();
    const initialTimeRemaining = Math.floor(
      (endTime - currentTime) / 1000
    );
    if (initialTimeRemaining > 10 * 60) {
      console.log("good try")
      navigate("/instructions");
      return;
    }
    setTimeRemaining(initialTimeRemaining);

    const fetchQuestions = async () => {
      try {
        const attempted = await fetch(
          `${process.env.REACT_APP_BACKEND}/quiz/attempted`,
          {
            credentials: "include",
          }
        );
        if (attempted.ok) {
          navigate('/submitted')
          return;
        }
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/quiz/get`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Image: string
        // Options: { Id: number[], Value: string }
        // Question: string
        // QuestionID: number[]
        // Shift: number
        const data = await response.json();
        const transformedQuestions = data.questions.map((question, index) => {
          return {
            _id: index,
            question: question.Question,
            options: question.Options.map(opt => opt.Value),
            backendId: question.QuestionID, // Keep original byte array for submission
            backendOptions: question.Options, // Keep original options with byte array IDs
            backendShift: question.Shift,
            image: question.Image
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
        

        const selectedOption = question.backendOptions.find(opt => opt.Value === answerValue);
        if (!selectedOption) return null;
        
        // Backend expects Quiz_Answer format with byte array IDs
        return {
          QuestionID: question.backendId, // Byte array format
          Answer: selectedOption.Id       // Byte array format for option ID
        };
      }).filter(Boolean);

      // Form_Responses structure according to swagger docs
      const submissionData = {
        Image: capturedImage, // Use the latest captured image
        Responses: responses,
        FlagsRaised: flags,
      };

      console.log(submissionData);
      console.log(`Mkc teri ${flags} baar`);
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
      setError(`Retry in 30 seconds`);
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
              <CustomWebcam onImageCapture={handleImageCapture} flag={() => setFlags(flags + 1)} />
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
          <div className="flex flex-col gap-2 w-[20vw]">
            <div>{error}</div>
            <button
              onClick={handleSubmit}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded duration-[250ms] hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
