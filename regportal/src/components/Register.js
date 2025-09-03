import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";

const QUESTIONS_PER_PAGE = 4;
const STORAGE_KEY = "regportal-answers";

export default function Register() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();


  useEffect(() => {
    fetchWithAuth("/checkRegistered")
      .then((res) => res.json())
      .then((data) => {
        if (data.registered === true) {
          navigate("/already-registered");
        } else {
          fetchWithAuth("/regQuestions")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data.regQuestions)) setQuestions(data.regQuestions);
              else setQuestions([]);

              const saved = localStorage.getItem(STORAGE_KEY);
              if (saved) setAnswers(JSON.parse(saved));
              setLoading(false);
            })
            .catch(() => {
              setGlobalError("Failed to load questions");
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setGlobalError("Failed to check registration status");
        setLoading(false);
      });

  }, []);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const currentQuestions = questions.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

  const handleChange = (qid, value) => {
    const updatedAnswers = { ...answers, [qid]: value };
    setAnswers(updatedAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));


    const question = questions.find((q) => q.QuestionID === qid);
    if (question?.Validation) {
      const pattern = new RegExp(question.Validation);
      setErrors((prev) => ({
        ...prev,
        [qid]: pattern.test(value) ? "" : "Invalid format",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [qid]: "" }));
    }
  };

  const validatePage = () => {
    let hasError = false;
    const newErrors = { ...errors };

    for (const q of currentQuestions) {
      const answer = answers[q.QuestionID] || "";


      if (q.QuestionType && !answer) {
        newErrors[q.QuestionID] = "This field is required";
        hasError = true;
      }


      if (q.Validation && answer && !new RegExp(q.Validation).test(answer)) {
        newErrors[q.QuestionID] = "Invalid format";
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) setGlobalError("Please fix the errors before continuing.");
    else setGlobalError("");
    return !hasError;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validatePage()) setPage((prev) => prev + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setGlobalError("");
    setPage((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};

    for (const q of questions) {
      const answer = answers[q.QuestionID] || "";

      if (q.QuestionType && !answer) {
        newErrors[q.QuestionID] = "This field is required";
        hasError = true;
      }
      if (q.Validation && answer && !new RegExp(q.Validation).test(answer)) {
        newErrors[q.QuestionID] = "Invalid format";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      setGlobalError("Please fix the errors before submitting.");
      return;
    }

    const RegAnswers = questions.map((q) => ({
      QuestionID: q.QuestionID,
      QuestionType: q.QuestionType,
      Answer: answers[q.QuestionID] || "",
    }));

    const res = await fetchWithAuth("/register", {
      method: "POST",
      body: JSON.stringify({ RegAnswers }),
    });

    if (res.ok) {
      localStorage.removeItem(STORAGE_KEY);
      navigate("/thankyou");
    } else setGlobalError("Failed to submit. Please try again.");
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    fetchWithAuth("/logout").then(() => {
      window.location.href = "/";
    });
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col relative bg-gray-900">
      <img
        src="/3.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
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
          <form className="space-y-3" onSubmit={page === totalPages - 1 ? handleSubmit : handleNext}>
            {currentQuestions.map((q) => (
              <div key={q.QuestionID} className="mb-4">
                <label className="block mb-1 font-semibold">
                  {q.Question || "Question"}
                  {q.QuestionType && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  className={`w-full px-2 py-1 lg:p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 
                    ${
                      errors[q.QuestionID]
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  value={answers[q.QuestionID] || ""}
                  onChange={(e) => handleChange(q.QuestionID, e.target.value)}
                  required={!!q.QuestionType}
                />
                {errors[q.QuestionID] && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors[q.QuestionID]}
                  </p>
                )}
              </div>
            ))}

            {globalError && (
              <div className="text-red-400 text-sm mb-2">{globalError}</div>
            )}

            <div className="flex justify-between items-center mt-10 mb-5">
              <span className="text-xs lg:text-md">#CCS #Batchof2029</span>
              <div>
                {page > 0 && (
                  <button
                    onClick={handlePrev}
                    className="mr-2 px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 border-2 border-gray-700 transition-all"
                  >
                    Previous
                  </button>
                )}
                {page < totalPages - 1 && (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white border-2 border-gray-700 transition-all"
                  >
                    Next
                  </button>
                )}
                {page === totalPages - 1 && (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white border-2 border-gray-700 transition-all"
                  >
                    Submit
                  </button>
                )}
              </div>
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