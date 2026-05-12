"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle, XCircle, SkipForward, RotateCcw, Clock } from "lucide-react";
import { MasterQuestion } from "@/types/task";
import { AIFeedback } from "./AIFeedback";

interface MasterResult {
  score: number;
  passed: boolean;
  weakAreas: string[];
}

interface MasterModeProps {
  questions: MasterQuestion[];
  subject: string;
  timeLimit?: number;
  onComplete?: (result: MasterResult) => void;
}

export function MasterMode({ questions, subject, timeLimit, onComplete }: MasterModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion?.id] || "";

  if (!currentQuestion) {
    return <div className="text-center p-8">No questions available</div>;
  }

  const isCorrect = userAnswer === currentQuestion.correctAnswer;

  const totalCorrect = Object.keys(userAnswers).filter((id) => {
    const question = questions.find((q) => q.id === id);
    return question && userAnswers[id] === question.correctAnswer;
  }).length;

  const score = Math.round((totalCorrect / questions.length) * 100);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const getPerformanceLabel = (scoreVal: number) => {
    if (scoreVal >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (scoreVal >= 60) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    return { label: "Needs Improvement", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  };

  const performanceInfo = getPerformanceLabel(score);

  const handleAnswer = (optionId: string) => {
    if (!submitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  const handleSubmit = () => {
    if (!userAnswer) {
      alert("Please select an answer");
      return;
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setCompleted(true);
      const weakAreas = questions
        .filter(q => {
          const ans = userAnswers[q.id] || "";
          return ans !== q.correctAnswer;
        })
        .map(q => q.text);
      const passed = score >= 80;
      onComplete?.({ score, passed, weakAreas });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSubmitted(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setCompleted(false);
    setTimeRemaining(timeLimit ? timeLimit * 60 : null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (completed) {
    // Prepare answers data for AI
    const answersData = questions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      userAnswer: userAnswers[q.id] || "",
      correctAnswer: q.options.find(opt => opt.id === q.correctAnswer)?.text || "",
      isCorrect: (userAnswers[q.id] || "") === q.correctAnswer,
      category: q.category,
    }));

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="text-center py-6 bg-card rounded-2xl border border-border">
          <div className="inline-flex items-center justify-center mb-2">
            <div className={`text-5xl font-bold ${performanceInfo.color}`}>{score}%</div>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalCorrect} / {questions.length} correct
          </p>
          <div className="mt-3 flex gap-3 justify-center">
            <button onClick={handleRetry} className="text-sm text-accent hover:underline">
              Retry Test
            </button>
            <button className="text-sm text-muted-foreground hover:underline">
              Back to Learning
            </button>
          </div>
        </div>

        {/* AI Feedback */}
        <AIFeedback
          mode="master"
          subject={subject}
          score={score}
          answers={answersData}
          weakAreas={questions
            .filter(q => (userAnswers[q.id] || "") !== q.correctAnswer)
            .map(q => q.text)}
        />

        {/* Performance Message (only for master mode) */}
        {score >= 80 ? (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
            <p className="text-sm text-green-800">🏆 Outstanding! You've mastered this topic.</p>
          </div>
        ) : score >= 60 ? (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
            <p className="text-sm text-blue-800">✓ Good performance! Review the questions you missed.</p>
          </div>
        ) : (
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
            <p className="text-sm text-orange-800">💪 Keep studying! Review the material and try again.</p>
          </div>
        )}

        {/* Question Breakdown */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">Question Breakdown</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id] || "";
              const isQCorrect = userAns === q.correctAnswer;
              const selectedOption = q.options.find(opt => opt.id === userAns);
              const correctOption = q.options.find(opt => opt.id === q.correctAnswer);

              return (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 mt-0.5">
                    {isQCorrect ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">Q{idx + 1}: {q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your answer: <span className={isQCorrect ? "text-green-600" : "text-red-600"}>
                        {selectedOption?.text || "(no answer)"}
                      </span>
                    </p>
                    {!isQCorrect && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Correct: {correctOption?.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Master Test</h2>
            <p className="text-muted-foreground text-sm">{subject}</p>
          </div>
          <div className="flex gap-6">
            {timeRemaining !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={14} />
                  Time
                </p>
                <p className={`text-2xl font-bold font-mono ${timeRemaining < 60 ? "text-red-600" : "text-foreground"}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Question</p>
              <p className="text-2xl font-bold text-accent">
                {currentQuestionIndex + 1}/{questions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card-base bg-card rounded-2xl border border-border p-8 shadow-md mb-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Question {currentQuestionIndex + 1}</p>
          <h3 className="text-2xl font-bold text-foreground leading-relaxed">{currentQuestion.text}</h3>
        </div>

        {!submitted && currentQuestion.hint && (
          <p className="text-xs text-muted-foreground mb-6 italic">
            💡 Hint: {currentQuestion.hint}
          </p>
        )}

        {!submitted ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    userAnswer === option.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={userAnswer === option.id}
                    onChange={() => handleAnswer(option.id)}
                    className="w-4 h-4 text-accent focus:ring-accent"
                  />
                  <span className="ml-3 text-foreground">{option.text}</span>
                </label>
              ))}
            </div>
            
            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
              Submit Answer
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border-2 ${
              isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm mb-3">
                      Correct answer: <span className="font-mono font-semibold">
                        {currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswer)?.text}
                      </span>
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>

            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLastQuestion ? "See Results" : "Next Question"}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="card-base bg-secondary/30 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Correct so far</p>
            <p className="font-bold text-foreground">{totalCorrect}/{questions.length}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-muted-foreground">Current Score</p>
            <p className="font-bold text-accent">{score}%</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-muted-foreground">Questions Left</p>
            <p className="font-bold text-foreground">{questions.length - currentQuestionIndex - 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
}