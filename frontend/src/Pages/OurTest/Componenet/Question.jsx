import React, { useState, useEffect } from "react";

const Question = ({ question, onAnswerChange, onMarkForReview, isMarkedForReview, onClear }) => {
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    setSelectedOption("");
  }, [question]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    onAnswerChange(question._id, option);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-3">{question.question}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`question-${question._id}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionChange(option)}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-x-3 max-xxsm:flex-col">
      <button
        onClick={onMarkForReview}
        className={`mt-4 px-3 py-1 rounded ${
          isMarkedForReview ? "bg-yellow-500 text-white" : "bg-gray-200 hover:bg-gray-300 duration-200 text-gray-700"
        }`}
      >
        {isMarkedForReview ? "Unmark for Review" : "Mark for Review"}
      </button>
      <button className="mt-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 duration-200 text-gray-700" onClick={() => {setSelectedOption(''); onClear(question._id)}}>Clear</button>
      </div>
    </div>
  );
};

export default Question;