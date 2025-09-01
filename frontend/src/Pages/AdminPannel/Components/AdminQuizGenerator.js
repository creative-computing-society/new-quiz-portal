import React, { useState, useEffect } from "react";
import "../Style/AdminPanel.css";

const AdminPanel = () => {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const userObject = JSON.parse(user);
          const email = userObject.email;
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND}/api/v1/questions/getAllQuestions`,
            {
              credentials: "include",
              headers: {
                Authorization: `${localStorage.getItem("jwt")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setQuestions(data.questions);
          } else {
            // console.error("Failed to fetch questions: ", response.statusText);
            // alert("Failed to fetch questions. Please try again.");
          }
        } else {
          // console.error("No user found in localStorage.");
          // alert("No user found in localStorage.");
        }
      } catch (error) {
        // console.error("Error fetching questions:", error);
        alert("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, []);

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
  };

  const handleNewTopicChange = (e) => {
    setNewTopic(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const handleAddTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic("");
    }
  };

  const handleGenerateQuestion = async () => {
    if (!selectedTopic) {
      alert("Please select a topic first");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/questions/generateQuestion?topic=${selectedTopic}`,
        {
          credentials: "include",
          headers: {
            Authorization: `${localStorage.getItem("jwt")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
        setOptions(data.options);
        setCorrectAnswer(data.correctAnswer);
      } else {
        console.error("Error generating question: ", response.statusText);
        alert("Failed to generate question. Please try again.");
      }
    } catch (error) {
      console.error("Error generating question:", error);
      alert("Failed to generate question. Please try again.");
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (e) => {
    setCorrectAnswer(e.target.value);
  };

  const handleAddQuestion = async () => {
    if (
      !question ||
      options.some((opt) => !opt) ||
      !correctAnswer ||
      !difficulty
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userObject = JSON.parse(user);
        const email = userObject.email;
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/questions/createQuestion`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${localStorage.getItem("jwt")}`,
            },
            credentials: "include",
            body: JSON.stringify({
              questionNumber: 7,
              question: question,
              options: options,
              answer: correctAnswer,
              difficulty: difficulty,
              slot: 1,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          // console.log("Question created successfully:", data);
        } else {
          // console.error("Failed to create question:", data);
        }
      } else {
        console.error("No user found in local storage.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container">
      <h1 className="title">Quiz Generator Admin Panel</h1>

      <div className="flex-row">
        <select
          className="select"
          value={selectedTopic}
          onChange={handleTopicChange}
        >
          <option value="">Select a topic</option>
          {topics.map((topic, index) => (
            <option key={index} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <button
          className="button generate-button"
          onClick={handleGenerateQuestion}
        >
          Generate New Question
        </button>
      </div>

      <div className="flex-row">
        <input
          type="text"
          className="input"
          placeholder="Enter new topic"
          value={newTopic}
          onChange={handleNewTopicChange}
        />

        <button className="button add-button" onClick={handleAddTopic}>
          Add Topic
        </button>
      </div>

      <div className="flex-row">
        <select
          className="select"
          value={difficulty}
          onChange={handleDifficultyChange}
        >
          <option value="">Select difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="textarea-container">
        <textarea
          className="textarea"
          rows="4"
          placeholder="Question"
          value={question}
          onChange={handleQuestionChange}
        ></textarea>
      </div>

      <div className="options-container">
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            className="input option-input"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          className="input"
          placeholder="Correct Answer"
          value={correctAnswer}
          onChange={handleCorrectAnswerChange}
        />
      </div>

      <button
        className="button add-question-button"
        onClick={handleAddQuestion}
      >
        Add Question to Quiz
      </button>
      <div className="questions-container">
        <h2 className="subtitle">All Questions</h2>
        {currentQuestion ? (
          <div>
            <p className="question">{currentQuestion.question}</p>
            <ul className="options-list">
              {currentQuestion.options.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
            <p className="correct-answer">
              Correct Answer: {currentQuestion.answer}
            </p>
            <p className="difficulty">
              Difficulty: {currentQuestion.difficulty}
            </p>
            {questions.length > 1 && (
              <button
                className="button next-button"
                onClick={handleNextQuestion}
              >
                Next
              </button>
            )}
          </div>
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
