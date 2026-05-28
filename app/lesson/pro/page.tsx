"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";

import { QuizHeader } from "@/components/professional/quiz-header";
import { QuestionCard } from "@/components/professional/question-card";
import { AnswerOption } from "@/components/professional/answer-option";
import { ValidationBar } from "@/components/professional/validation-bar";
import { SourcePanel } from "@/components/professional/source-panel";
import { ComboDisplay } from "@/components/professional/combo-display";
import { useSound } from "@/hooks/use-sound";

// Types
type Question = {
  id: number;
  question: string;
  options: { id: number; text: string }[];
  correctOptionId: number;
  difficulty?: number;
  source?: string;
  explanation?: string;
};

type Source = {
  title: string;
  reference: string;
  excerpt: string;
  pdfUrl?: string;
};

// Mock data for demonstration
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Quel est le principe fondamental de l'organisation de l'État français ?",
    options: [
      { id: 1, text: "La séparation des pouvoirs" },
      { id: 2, text: "La centralisation absolue" },
      { id: 3, text: "Le fédéralisme" },
      { id: 4, text: "La confédération" },
    ],
    correctOptionId: 1,
    difficulty: 1,
    source: "Constitution du 4 octobre 1958",
    explanation: "La Constitution de 1958 établit le principe de séparation des pouvoirs (exécutif, législatif, judiciaire) comme fondement de l'organisation de l'État.",
  },
  {
    id: 2,
    question: "Quelle loi a initié le premier acte de décentralisation en France ?",
    options: [
      { id: 1, text: "Loi Defferre du 2 mars 1982" },
      { id: 2, text: "Loi NOTRe de 2015" },
      { id: 3, text: "Loi MAPTAM de 2014" },
      { id: 4, text: "Loi Chevènement de 1999" },
    ],
    correctOptionId: 1,
    difficulty: 2,
    source: "Loi n°82-213 du 2 mars 1982",
    explanation: "La loi Defferre du 2 mars 1982 relative aux droits et libertés des communes, des départements et des régions constitue le premier acte de décentralisation.",
  },
  {
    id: 3,
    question: "Quel document d'urbanisme fixe les orientations fondamentales d'aménagement à l'échelle intercommunale ?",
    options: [
      { id: 1, text: "Le SCoT (Schéma de Cohérence Territoriale)" },
      { id: 2, text: "Le PLU (Plan Local d'Urbanisme)" },
      { id: 3, text: "La carte communale" },
      { id: 4, text: "Le RNU (Règlement National d'Urbanisme)" },
    ],
    correctOptionId: 1,
    difficulty: 2,
    source: "Code de l'urbanisme - Articles L141-1 et suivants",
    explanation: "Le SCoT est l'outil de conception et de mise en œuvre d'une planification stratégique à l'échelle intercommunale.",
  },
  {
    id: 4,
    question: "Quelle est la durée du mandat d'un conseiller départemental ?",
    options: [
      { id: 1, text: "3 ans" },
      { id: 2, text: "5 ans" },
      { id: 3, text: "6 ans" },
      { id: 4, text: "7 ans" },
    ],
    correctOptionId: 3,
    difficulty: 1,
    source: "Code électoral",
    explanation: "Les conseillers départementaux sont élus pour un mandat de 6 ans, renouvelé par moitié tous les 3 ans.",
  },
  {
    id: 5,
    question: "Quel est le rôle du certificat d'urbanisme ?",
    options: [
      { id: 1, text: "Autoriser la construction d'un bâtiment" },
      { id: 2, text: "Renseigner sur les règles d'urbanisme applicables à un terrain" },
      { id: 3, text: "Approuver le plan local d'urbanisme" },
      { id: 4, text: "Délivrer le permis de démolir" },
    ],
    correctOptionId: 2,
    difficulty: 1,
    source: "Code de l'urbanisme - Article L410-1",
    explanation: "Le certificat d'urbanisme est un document d'information qui indique les règles d'urbanisme applicables à un terrain et la faisabilité d'un projet.",
  },
];

const MOCK_SOURCES: Source[] = [
  {
    title: "Constitution du 4 octobre 1958",
    reference: "Article 16 de la Constitution",
    excerpt: "Le Président de la République assure, par son arbitrage, le fonctionnement régulier des pouvoirs publics ainsi que la continuité de l'État.",
    pdfUrl: "#",
  },
  {
    title: "Code général des collectivités territoriales",
    reference: "CGCT - Partie législative",
    excerpt: "Les collectivités territoriales de la République sont les communes, les départements, les régions, les collectivités à statut particulier et les collectivités d'outre-mer.",
    pdfUrl: "#",
  },
];

export default function QuizProPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);

  const playCorrect = useSound("/sounds/correct.mp3", 0.3);
  const playIncorrect = useSound("/sounds/incorrect.mp3", 0.3);
  const playCombo = useSound("/sounds/combo.mp3", 0.3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (!isFinished) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished]);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === MOCK_QUESTIONS.length - 1;

  const handleSelectOption = useCallback((optionId: number) => {
    if (!isRevealed) {
      setSelectedOption(optionId);
    }
  }, [isRevealed]);

  const handleValidate = useCallback(() => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionId;
    setIsRevealed(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      playCorrect();
      if (combo >= 2) playCombo();
    } else {
      setCombo(0);
      playIncorrect();
    }

    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, correct: isCorrect }]);
  }, [selectedOption, currentQuestion, combo, playCorrect, playIncorrect, playCombo]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsRevealed(false);
  }, [isLastQuestion]);

  const handleRetry = useCallback(() => {
    setSelectedOption(null);
    setIsRevealed(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      const keyMap: Record<string, number> = {
        a: 0, A: 0,
        b: 1, B: 1,
        c: 2, C: 2,
        d: 3, D: 3,
      };

      if (keyMap[e.key] !== undefined && !isRevealed) {
        const option = currentQuestion.options[keyMap[e.key]];
        if (option) {
          handleSelectOption(option.id);
        }
      }

      if (e.key === "Enter") {
        if (!isRevealed && selectedOption !== null) {
          handleValidate();
        } else if (isRevealed) {
          handleNext();
        }
      }

      if (e.key === "s" || e.key === "S") {
        setIsSourcePanelOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, isRevealed, selectedOption, currentQuestion, handleSelectOption, handleValidate, handleNext]);

  // Result screen
  if (isFinished) {
    const percentage = Math.round((score / MOCK_QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-lg w-full text-center"
        >
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
            percentage >= 80
              ? "bg-emerald-100"
              : percentage >= 50
              ? "bg-amber-100"
              : "bg-rose-100"
          }`}>
            <BookOpen className={`w-10 h-10 ${
              percentage >= 80
                ? "text-emerald-600"
                : percentage >= 50
                ? "text-amber-600"
                : "text-rose-600"
            }`} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Quiz terminé !
          </h2>
          <p className="text-slate-500 mb-6">
            Vous avez complété le quiz en {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-navy-700">{score}</p>
              <p className="text-xs text-slate-500">Bonnes réponses</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-700">{MOCK_QUESTIONS.length - score}</p>
              <p className="text-xs text-slate-500">Mauvaises réponses</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{combo}</p>
              <p className="text-xs text-slate-500">Meilleur combo</p>
            </div>
          </div>

          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                percentage >= 80
                  ? "bg-emerald-500"
                  : percentage >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsRevealed(false);
                setCombo(0);
                setScore(0);
                setIsFinished(false);
                setTimeElapsed(0);
                setAnswers([]);
              }}
              className="px-6 py-3 bg-navy-700 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors"
            >
              Recommencer
            </button>
            <button
              onClick={() => router.push("/learn")}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Retour à l'apprentissage
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <QuizHeader
        title="Quiz mode pro"
        currentQuestion={currentIndex}
        totalQuestions={MOCK_QUESTIONS.length}
        timeElapsed={timeElapsed}
      />

      {/* Combo Display */}
      <ComboDisplay combo={combo} />

      {/* Source Panel */}
      <SourcePanel
        isOpen={isSourcePanelOpen}
        onClose={() => setIsSourcePanelOpen(false)}
        sources={MOCK_SOURCES}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-[800px] mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        {/* Question */}
        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentIndex + 1}
          totalQuestions={MOCK_QUESTIONS.length}
          difficulty={currentQuestion.difficulty}
          source={currentQuestion.source}
        />

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <AnswerOption
              key={`${currentIndex}-${option.id}`}
              text={option.text}
              letter={String.fromCharCode(65 + index)}
              isSelected={selectedOption === option.id}
              isCorrect={
                isRevealed
                  ? option.id === currentQuestion.correctOptionId
                    ? true
                    : selectedOption === option.id
                    ? false
                    : null
                  : null
              }
              isRevealed={isRevealed}
              onClick={() => handleSelectOption(option.id)}
              disabled={isRevealed}
            />
          ))}
        </div>

        {/* Source button */}
        <button
          onClick={() => setIsSourcePanelOpen(true)}
          className="flex items-center gap-2 text-sm text-navy-700 hover:text-navy-800 font-medium transition-colors"
        >
          <FileText className="w-4 h-4" />
          Voir les sources juridiques (S)
        </button>
      </div>

      {/* Validation Bar */}
      <ValidationBar
        isCorrect={
          isRevealed
            ? selectedOption === currentQuestion.correctOptionId
            : null
        }
        isRevealed={isRevealed}
        hasSelection={selectedOption !== null}
        onValidate={handleValidate}
        onNext={handleNext}
        onRetry={handleRetry}
        isLastQuestion={isLastQuestion}
        explanation={currentQuestion.explanation}
      />
    </div>
  );
}
