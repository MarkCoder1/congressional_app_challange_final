"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle, XCircle, Lightbulb, RotateCcw, Brain } from "lucide-react";
import { PracticeQuestion } from "@/types/task";
import { AIFeedback } from "./AIFeedback";
import { StudentUnderstandingFeedback } from "@/components/task-workspace/StudentUnderstandingFeedback";
import {
  generateLearningStats,
  generateUnderstandingFeedback,
  detectWeakAreas,
  type ConfidenceLevel,
} from "@/lib/mockLearningData";


interface PracticeResult {
  score: number;
  weakAreas: string[];
  stats?: ReturnType<typeof generateLearningStats>;
  feedback?: ReturnType<typeof generateUnderstandingFeedback>;
}

interface PracticeModeProps {
  questions: PracticeQuestion[];
  subject: string;
  onComplete?: (result: PracticeResult) => void;
}

export function PracticeMode({ questions, subject, onComplete }: PracticeModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [startTime] = useState(() => Date.now());
  const [practiceStats, setPracticeStats] = useState<ReturnType<typeof generateLearningStats> | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<ReturnType<typeof generateUnderstandingFeedback> | null>(null);

  const [showFeedback, setShowFeedback] = useState(false);


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
      
      // Calculate time spent
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      const mistakes = questions.length - totalCorrect;
      
      // Generate learning stats and feedback
      const stats = generateLearningStats(score, questions.length, mistakes, timeSpentMinutes, confidence || "medium");
      const feedback = generateUnderstandingFeedback(stats, weakAreas);
      
      // Store in state for rendering
      setPracticeStats(stats);
      setPracticeFeedback(feedback);
      
      onComplete?.({ 
        score, 
        weakAreas,
        stats,
        feedback 
      });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSubmitted(false);
      setShowHint(false);
      setShowConfidence(false);
      setConfidence(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setShowHint(false);
    setCompleted(false);
  };

  if (completed) {
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
        {/* Results Header - Simplified */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="text-4xl font-bold text-accent">{score}%</div>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalCorrect} / {questions.length} correct
          </p>
          <button onClick={handleRetry} className="mt-4 text-sm text-accent hover:underline">
            Retry Practice
          </button>
        </div>

        {/* AI Insights - 3 boxes directly */}
        <AIFeedback
          mode="practice"
          subject={subject}
          score={score}
          answers={answersData}
          weakAreas={questions
            .filter(q => (userAnswers[q.id] || "") !== q.correctAnswer)
            .map(q => q.text)}
        />

        {/* Student Understanding Feedback (Phase 10.4) */}
        {practiceFeedback && (
          <StudentUnderstandingFeedback feedback={practiceFeedback} />
        )}

        {/* Question Breakdown - Collapsible? Or keep as is */}
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Practice Mode</h2>
            <p className="text-muted-foreground text-sm">{subject}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Question</p>
            <p className="text-2xl font-bold text-accent">
              {currentQuestionIndex + 1}/{questions.length}
            </p>
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
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Question</p>
          <h3 className="text-2xl font-bold text-foreground leading-relaxed">{currentQuestion.text}</h3>
        </div>

        {currentQuestion.hint && (
          <div className="mb-8">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Lightbulb size={18} />
              <span className="font-medium">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            {showHint && (
              <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">{currentQuestion.hint}</p>
              </div>
            )}
          </div>
        )}

        {!submitted ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${userAnswer === option.id
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
            <div className={`p-6 rounded-lg border-2 ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2">{isCorrect ? "Correct!" : "Incorrect"}</p>
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

            {/* Confidence Indicator */}
            {!showConfidence && !isLastQuestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">How confident are you about this answer?</p>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as ConfidenceLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setConfidence(level);
                        setShowConfidence(true);
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        level === "low"
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                          : level === "medium"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
                          : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showConfidence && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800">
                  ✓ Confidence recorded: <span className="font-semibold">{confidence}</span>
                </p>
              </div>
            )}

            <button 
              onClick={handleNext} 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!showConfidence && !isLastQuestion}
            >
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