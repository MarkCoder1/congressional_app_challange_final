"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle, XCircle, SkipForward, RotateCcw, Clock } from "lucide-react";
import { MasterQuestion } from "@/lib/types";

interface MasterModeProps {
  questions: MasterQuestion[];
  subject: string;
  timeLimit?: number; // in minutes
  onComplete?: (score: number) => void;
}

export function MasterMode({ questions, subject, timeLimit, onComplete }: MasterModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id] || "";
  const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.expectedAnswer?.toLowerCase().trim();

  const totalCorrect = Object.keys(userAnswers).filter((id) => {
    const question = questions.find((q) => q.id === id);
    return question && userAnswers[id].toLowerCase().trim() === question.expectedAnswer?.toLowerCase().trim();
  }).length;

  const score = Math.round((totalCorrect / questions.length) * 100);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Performance label
  const getPerformanceLabel = (scoreVal: number) => {
    if (scoreVal >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (scoreVal >= 60) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    return { label: "Needs Improvement", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  };

  const performanceInfo = getPerformanceLabel(score);

  const handleAnswer = (text: string) => {
    if (!submitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: text,
      }));
    }
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please enter an answer");
      return;
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setCompleted(true);
      onComplete?.(score);
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
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Results Screen */}
        <div className="text-center space-y-8 py-12">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center ${
              score >= 80 
                ? "bg-gradient-to-br from-green-100 to-green-50 border-green-500"
                : score >= 60
                  ? "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-500"
                  : "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500"
            }`}>
              <div className="text-center">
                <div className={`text-6xl font-bold ${performanceInfo.color}`}>{score}%</div>
                <div className="text-sm text-muted-foreground mt-2">Test Score</div>
              </div>
            </div>
          </div>

          {/* Performance Label */}
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${performanceInfo.color}`}>
              {performanceInfo.label}
            </h2>
            <p className="text-lg text-muted-foreground">
              You answered{" "}
              <span className="font-semibold text-foreground">
                {totalCorrect} out of {questions.length}
              </span>{" "}
              questions correctly
            </p>
          </div>

          {/* Performance Message */}
          <div className={`rounded-lg p-6 border-2 ${performanceInfo.bg} ${performanceInfo.border}`}>
            <p className={`font-medium ${performanceInfo.color}`}>
              {score >= 80
                ? "🏆 Outstanding performance! You've mastered this material."
                : score >= 60
                  ? "✓ Good performance! Review challenging areas and try again to improve."
                  : "💪 You need to study more. Review the material and take the test again."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Retry Test
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <SkipForward size={18} />
              Back to Learning
            </button>
          </div>

          {/* Detailed Results */}
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-bold text-foreground">Results Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-muted-foreground text-sm">Correct</p>
                <p className="text-3xl font-bold text-green-600">{totalCorrect}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-muted-foreground text-sm">Incorrect</p>
                <p className="text-3xl font-bold text-red-600">{questions.length - totalCorrect}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-muted-foreground text-sm">Total Questions</p>
                <p className="text-3xl font-bold text-foreground">{questions.length}</p>
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="mt-12 space-y-4 text-left">
            <h3 className="text-xl font-bold text-foreground">Question Breakdown</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id] || "";
                const isQCorrect = userAns.toLowerCase().trim() === q.expectedAnswer?.toLowerCase().trim();
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {isQCorrect ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        Q{idx + 1}: {q.text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: <span className={isQCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{userAns || "(no answer)"}</span>
                      </p>
                      {!isQCorrect && (
                        <p className="text-sm text-muted-foreground">
                          Correct answer: <span className="text-green-600 font-medium">{q.expectedAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card-base bg-card rounded-2xl border border-border p-8 shadow-md mb-8">
        {/* Question Text */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Question {currentQuestionIndex + 1}</p>
          <h3 className="text-2xl font-bold text-foreground leading-relaxed">{currentQuestion.text}</h3>
        </div>

        {/* Note: No Hint in Master Mode */}
        {!submitted && (
          <p className="text-xs text-muted-foreground mb-6 italic">
            💡 Hint: {currentQuestion.hint}
          </p>
        )}

        {/* Answer Input */}
        {!submitted ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Answer:</label>
              <textarea
                value={userAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200 resize-none"
                rows={3}
                disabled={submitted}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Submit Answer
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feedback */}
            <div
              className={`p-6 rounded-lg border-2 ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
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
                      Correct answer: <span className="font-mono font-semibold">{currentQuestion.expectedAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLastQuestion ? "See Results" : "Next Question"}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
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
