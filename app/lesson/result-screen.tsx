"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

type AnswerRecord = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pdfFileName: string;
  sourceChunk: string;
  sourceSection?: string | null;
};

type Props = {
  totalQuestions: number;
  correctCount: number;
  pointsEarned: number;
  answers: AnswerRecord[];
  onRetryWrong: () => void;
  onGoBack: () => void;
};

export const ResultScreen = ({
  totalQuestions,
  correctCount,
  pointsEarned,
  answers,
  onRetryWrong,
  onGoBack,
}: Props) => {
  const router = useRouter();
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPoints, setDisplayPoints] = useState(0);
  const wrongAnswers = answers.filter((a) => !a.isCorrect);

  // Animations de compteur
  useEffect(() => {
    const scoreDuration = 1500;
    const pointsDuration = 1000;
    const scoreStep = Math.max(1, Math.floor(correctCount / 30));
    const pointsStep = Math.max(1, Math.floor(pointsEarned / 20));

    const scoreInterval = setInterval(() => {
      setDisplayScore((prev) => {
        const next = prev + scoreStep;
        if (next >= correctCount) {
          clearInterval(scoreInterval);
          return correctCount;
        }
        return next;
      });
    }, scoreDuration / (correctCount / scoreStep));

    const pointsInterval = setInterval(() => {
      setDisplayPoints((prev) => {
        const next = prev + pointsStep;
        if (next >= pointsEarned) {
          clearInterval(pointsInterval);
          return pointsEarned;
        }
        return next;
      });
    }, pointsDuration / (pointsEarned / pointsStep));

    return () => {
      clearInterval(scoreInterval);
      clearInterval(pointsInterval);
    };
  }, [correctCount, pointsEarned]);

  const getEmoji = () => {
    if (percentage >= 80) return "🎉";
    if (percentage >= 50) return "👍";
    return "💪";
  };

  const getTitle = () => {
    if (percentage >= 80) return "Félicitations !";
    if (percentage >= 50) return "Continue comme ça !";
    return "Garde la motivation !";
  };

  const getSubtitle = () => {
    if (percentage >= 80) return "Tu maîtrises ce sujet sur le bout des doigts !";
    if (percentage >= 50) return "Bonne progression, encore un peu de travail !";
    return "Continue à t'entraîner, tu vas y arriver !";
  };

  const getBadge = () => {
    if (percentage >= 90) return { label: "Excellent !", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (percentage >= 80) return { label: "Très bien !", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    return null;
  };

  const badge = getBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-2xl px-4 py-8"
    >
      {/* En-tête avec emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6 text-center"
      >
        <span className="text-7xl">{getEmoji()}</span>
      </motion.div>

      {/* Titre */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-2 text-center"
      >
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold text-slate-800">
          {getTitle()}
        </h1>
        <p className="mt-2 text-slate-500">{getSubtitle()}</p>
      </motion.div>

      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${badge.color}`}>
            <Star className="h-4 w-4 fill-current" />
            {badge.label}
          </span>
        </motion.div>
      )}

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-baseline gap-1">
          <span className="font-[family-name:var(--font-poppins)] text-6xl font-bold text-purple-600">
            {displayScore}
          </span>
          <span className="text-3xl font-semibold text-slate-400">
            /{totalQuestions}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          {/* Barre de progression circulaire simplifiée */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-100">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#7C3AED ${percentage}%, #F3E8FF ${percentage}%)`,
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-purple-600">
                {percentage}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Points gagnés */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-50 to-emerald-50 px-6 py-3">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-slate-700">
            <span className="text-purple-600">+{displayPoints}</span> points
          </span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <button
          onClick={onGoBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'apprentissage
        </button>
        {wrongAnswers.length > 0 && (
          <button
            onClick={onRetryWrong}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:from-purple-500 hover:to-purple-400"
          >
            <RotateCcw className="h-4 w-4" />
            Revoir les erreurs ({wrongAnswers.length})
          </button>
        )}
      </motion.div>

      {/* Erreurs */}
      {wrongAnswers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-700">
            Questions à revoir
          </h3>
          <div className="space-y-4">
            {wrongAnswers.map((answer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              >
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {answer.question}
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{answer.correctAnswer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span className="line-through">{answer.selectedAnswer}</span>
                  </div>
                </div>
                {/* Source badge */}
                <button
                  onClick={() => {
                    // On utilise un simple alert pour l'instant, la version modale sera intégrée
                    alert(`Source : ${answer.pdfFileName}\n\n${answer.sourceChunk}`);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700"
                >
                  <FileText className="h-3 w-3" />
                  Voir la source : {answer.pdfFileName}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
