import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, HelpCircle, RefreshCw, Trophy, Eye, Edit3, Send } from 'lucide-react';
import { QuizQuestion, QuizGradeResult } from '../types';

interface QuizSectionProps {
  quiz: QuizQuestion[];
  topic: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quiz, topic }) => {
  const [isAttemptMode, setIsAttemptMode] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [mcqChoices, setMcqChoices] = useState<Record<number, string>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, QuizGradeResult | { verdict: string; feedback: string }>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({});

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
        <HelpCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="font-medium text-slate-300">No quiz generated for this topic yet.</p>
        <p className="text-xs text-slate-500 mt-1">Try generating study material again.</p>
      </div>
    );
  }

  // Toggle reveal
  const toggleReveal = (index: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Check MCQ answer
  const handleCheckMCQ = (index: number, q: QuizQuestion) => {
    const chosen = mcqChoices[index];
    if (!chosen) {
      setResults((prev) => ({
        ...prev,
        [index]: { verdict: 'empty', feedback: 'Please select an option first.' },
      }));
      return;
    }

    const isCorrect = chosen.toUpperCase() === q.answer.trim().toUpperCase();
    const newResults = {
      ...results,
      [index]: {
        verdict: isCorrect ? 'correct' : 'incorrect',
        feedback: isCorrect ? 'Correct! Excellent deduction.' : `Not quite — correct answer is ${q.answer}.`,
      },
    };
    setResults(newResults);

    // Check if user completed all correctly for confetti celebration
    checkFullCompletion(newResults);
  };

  // Check Short Answer via AI grading API
  const handleCheckShort = async (index: number, q: QuizQuestion) => {
    const userAns = shortAnswers[index];
    if (!userAns || !userAns.trim()) {
      setResults((prev) => ({
        ...prev,
        [index]: { verdict: 'empty', feedback: 'Please type an answer before checking.' },
      }));
      return;
    }

    setLoadingQuestions((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await fetch('/api/study/grade-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          correct_answer: q.answer,
          user_answer: userAns,
        }),
      });
      const data = await res.json();
      const newResults = {
        ...results,
        [index]: {
          verdict: data.verdict || 'incorrect',
          feedback: data.feedback || 'Answer checked.',
          source: data.source || 'ai',
        },
      };
      setResults(newResults);
      checkFullCompletion(newResults);
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        [index]: {
          verdict: 'incorrect',
          feedback: 'Could not connect to grading engine. Compare with the reference answer below.',
        },
      }));
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [index]: false }));
    }
  };

  const checkFullCompletion = (currentResults: Record<number, any>) => {
    const checkedCount = Object.keys(currentResults).length;
    const correctCount = Object.values(currentResults).filter((r: any) => r.verdict === 'correct').length;

    if (checkedCount === quiz.length && correctCount === quiz.length) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Score stats
  const checkedKeys = Object.keys(results);
  const attemptedCount = checkedKeys.filter((k) => results[Number(k)]?.verdict !== 'empty').length;
  const correctCount = checkedKeys.filter((k) => results[Number(k)]?.verdict === 'correct').length;
  const weakQuestions = quiz.filter((_, idx) => results[idx]?.verdict === 'incorrect');

  const handleResetQuiz = () => {
    setRevealedAnswers({});
    setMcqChoices({});
    setShortAnswers({});
    setResults({});
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Mode:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setIsAttemptMode(false)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                !isAttemptMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Mode</span>
            </button>
            <button
              onClick={() => setIsAttemptMode(true)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                isAttemptMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Attempt Mode (AI Graded)</span>
            </button>
          </div>
        </div>

        {attemptedCount > 0 && (
          <button
            onClick={handleResetQuiz}
            className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors self-end sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Quiz</span>
          </button>
        )}
      </div>

      {/* Quiz Question Cards */}
      <div className="space-y-4">
        {quiz.map((q, idx) => {
          const result = results[idx];
          const isRevealed = revealedAnswers[idx];
          const isLoading = loadingQuestions[idx];

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-3.5"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Q{idx + 1}
                  </span>
                  <div className="text-sm font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                  {q.type === 'mcq' ? 'MCQ' : 'Short Answer'}
                </span>
              </div>

              {/* MCQ Options Rendering */}
              {q.type === 'mcq' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionText = q.options?.[letter];
                    if (!optionText) return null;
                    const isSelected = mcqChoices[idx] === letter;

                    return isAttemptMode ? (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setMcqChoices((prev) => ({ ...prev, [idx]: letter }))}
                        className={`p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 mt-0.5 leading-normal">{optionText}</span>
                      </button>
                    ) : (
                      <div
                        key={letter}
                        className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                          {letter}
                        </span>
                        <span className="flex-1 mt-0.5 leading-normal">{optionText}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Answer Input for Attempt Mode */}
              {isAttemptMode && q.type === 'short' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shortAnswers[idx] || ''}
                      onChange={(e) => setShortAnswers({ ...shortAnswers, [idx]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCheckShort(idx, q)}
                      placeholder="Type your answer here..."
                      className="flex-1 bg-slate-950/60 border border-slate-700/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckShort(idx, q)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Check</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MCQ Check Button for Attempt Mode */}
              {isAttemptMode && q.type === 'mcq' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCheckMCQ(idx, q)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Check Answer
                  </button>
                </div>
              )}

              {/* Grading Reaction Banner in Attempt Mode */}
              {isAttemptMode && result && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    result.verdict === 'correct'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : result.verdict === 'partial'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                      : result.verdict === 'empty'
                      ? 'bg-slate-900 border-slate-700 text-slate-400'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {result.verdict === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-1">
                    <div className="font-semibold">{result.feedback}</div>
                    <div className="text-slate-400 text-[11px]">
                      <span className="font-medium text-slate-300">Reference:</span> {q.answer}
                    </div>
                  </div>
                </div>
              )}

              {/* Reveal Mode Controls */}
              {!isAttemptMode && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReveal(idx)}
                    className="self-start text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
                  </button>

                  {isRevealed && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      <span className="font-semibold text-emerald-400">Answer:</span>{' '}
                      {q.type === 'mcq' && q.options?.[q.answer]
                        ? `${q.answer}) ${q.options[q.answer]}`
                        : q.answer}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Summary Panel */}
      {isAttemptMode && attemptedCount > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Quiz Score Summary</h4>
            </div>
            <div className="text-base font-extrabold text-indigo-300">
              {correctCount} / {attemptedCount} Correct
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 transition-all duration-500"
              style={{ width: `${(correctCount / quiz.length) * 100}%` }}
            />
          </div>

          {weakQuestions.length > 0 ? (
            <div className="text-xs text-slate-300 pt-1 space-y-1">
              <span className="font-semibold text-amber-300">💡 Recommended topics to review:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                {weakQuestions.map((wq, i) => (
                  <li key={i}>{wq.question}</li>
                ))}
              </ul>
            </div>
          ) : attemptedCount === quiz.length ? (
            <p className="text-xs font-semibold text-emerald-300">
              🎉 Perfect score! You have completely mastered this concept!
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};
