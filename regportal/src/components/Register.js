import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";

export default function Register() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already registered
    fetchWithAuth("/checkRegistered")
      .then(res => res.json())
      .then(data => {
        if (data.registered === true) {
          navigate("/already-registered");
        } else {
          // Load questions
          fetchWithAuth("/regQuestions")
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data.regQuestions)) setQuestions(data.regQuestions);
              else setQuestions([]);
              setLoading(false);
            })
            .catch(() => {
              setError("Failed to load questions");
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setError("Failed to check registration status");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  const handleChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    // Validate compulsory questions
    for (const q of questions) {
      if (q.QuestionType && !answers[q.QuestionID]) {
        setError("Please answer all compulsory questions.");
        return;
      }
    }

    // Prepare payload as per RespUser format
    const RegAnswers = questions.map(q => ({
      QuestionID: q.QuestionID,
      QuestionType: q.QuestionType,
      Answer: answers[q.QuestionID] || "",
    }));

    const res = await fetchWithAuth("/register", {
      method: "POST",
      body: JSON.stringify({ RegAnswers }),
    });

    if (res.ok) navigate("/thankyou");
    else setError("Failed to submit. Please try again.");
  };

  const handleLogout = () => {
    fetchWithAuth("/logout").then(() => {
      window.location.href = "/";
    });
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col relative bg-gray-900">
      <img src="/3.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="bg-gray-800 rounded-3xl w-[80%] md:w-[50%] lg:w-[35%] p-8 text-white relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex space-x-2">
            <div className="lg:w-4 w-3 h-3 lg:h-4 bg-red-500 rounded-full"></div>
            <div className="lg:w-4 w-3 h-3 lg:h-4 bg-yellow-500 rounded-full"></div>
            <div className="lg:w-4 w-3 h-3 lg:h-4 bg-green-500 rounded-full"></div>
          </div>
          <div className="font-mono text-sm">response.txt</div>
        </div>
        <div className="text-center mb-5">
          <img src="/year.png" alt="Logo" className="mx-auto w-32 lg:w-36" />
          <h1 className="text-white text-[11px] lg:text-sm font-mono">
            {`{Registration for Batch of 2029}`}
          </h1>
        </div>
        {loading ? (
          <div className="text-center text-gray-400">Loading questions...</div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            {questions.map(q => (
              <div key={q.QuestionID} className="mb-4">
                <label className="block mb-1 font-semibold">
                  {q.Question || q.regQuestions || "Question"}
                  {q.QuestionType && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  className="w-full px-2 py-1 lg:p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={answers[q.QuestionID] || ""}
                  onChange={e => handleChange(q.QuestionID, e.target.value)}
                  required={!!q.QuestionType}
                />
              </div>
            ))}
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <div className="flex justify-between items-center mt-10 mb-5">
              <span className="text-xs lg:text-md">#CCS #Batchof2028</span>
              <button
                type="submit"
                className="px-5 lg:px-14 py-2 bg-white lg:text-md text-xs text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white border-2 border-gray-700 transition-all"
              >
                SUBMIT
              </button>
            </div>
          </form>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}