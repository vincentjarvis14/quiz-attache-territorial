"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { challenges, challengeOptions } from "@/db/schema";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { reduceHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { useSound } from "@/hooks/use-sound";

import { Challenge } from "./challenge";
import { QuestionBubble } from "./question-bubble";
import { Footer } from "./footer";
import { Header } from "./header";
import { ResultScreen } from "./result-screen";
import { ComboDisplay } from "./combo-display";

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
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  initialHearts: number;
  initialPercentage: number;
  pdfFileName?: string;
};

export const Quiz = ({
  initialLessonId,
  initialLessonChallenges,
  initialHearts,
  initialPercentage,
  pdfFileName,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challenges] = useState(initialLessonChallenges);

  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none" | "completed">("none");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [combo, setCombo] = useState(0);

  // Sons
  const playCorrect = useSound("/correct.wav");
  const playIncorrect = useSound("/incorrect.wav");

  // Jouer les sons quand le statut change
  useEffect(() => {
    if (status === "correct") {
      playCorrect();
      setCombo((prev) => prev + 1);
    }
    if (status === "wrong") {
      playIncorrect();
      setCombo(0);
    }
  }, [status, playCorrect, playIncorrect]);

  const currentChallenge = challenges[activeIndex];
  const options = currentChallenge?.challengeOptions ?? [];

  const title = currentChallenge?.question || "Quiz terminé !";

  const onSelect = useCallback((id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  }, [status]);

  const onContinue = useCallback(() => {
    if (!currentChallenge) return;

    startTransition(async () => {
      if (status === "correct") {
        setActiveIndex((prev) => prev + 1);
        setStatus("none");
        setSelectedOption(undefined);
        setPercentage((prev) => {
          const newPercentage = Math.min(
            prev + 100 / challenges.length,
            100
          );
          return newPercentage;
        });

        if (activeIndex === challenges.length - 1) {
          setStatus("completed");
          return;
        }
        return;
      }

      if (status === "wrong") {
        setStatus("none");
        setSelectedOption(undefined);
        return;
      }

      if (status === "completed") {
        openPracticeModal();
        router.push("/learn");
        return;
      }
    });
  }, [
    status,
    currentChallenge,
    activeIndex,
    challenges.length,
    router,
    openPracticeModal,
    startTransition,
  ]);

  const onCheck = useCallback(() => {
    if (status !== "none") return;
    if (selectedOption === undefined) return;

    const correctOption = options.find((option) => option.correct);
    if (!correctOption) return;

    if (selectedOption === correctOption.id) {
      startTransition(async () => {
        const result = await upsertChallengeProgress(currentChallenge.id);

        if (result?.error === "hearts") {
          openHeartsModal();
          return;
        }

        setStatus("correct");
        setCorrectCount((prev) => prev + 1);
        setPointsEarned((prev) => prev + 10);

        // Enregistrer la réponse
        const selectedText = options.find((o) => o.id === selectedOption)?.text || "";
        const correctText = correctOption.text;
        setAnswers((prev) => [
          ...prev,
          {
            question: currentChallenge.question,
            selectedAnswer: selectedText,
            correctAnswer: correctText,
            isCorrect: true,
            pdfFileName: pdfFileName || "Document officiel",
            sourceChunk: currentChallenge.sourceChunk || "",
            sourceSection: currentChallenge.sourceSection || null,
          },
        ]);
      });
    } else {
      startTransition(async () => {
        const result = await reduceHearts(currentChallenge.id);

        if (result?.error === "hearts") {
          openHeartsModal();
          return;
        }

        setStatus("wrong");
        setHearts((prev) => Math.max(prev - 1, 0));

        // Enregistrer la réponse
        const selectedText = options.find((o) => o.id === selectedOption)?.text || "";
        const correctText = correctOption.text;
        setAnswers((prev) => [
          ...prev,
          {
            question: currentChallenge.question,
            selectedAnswer: selectedText,
            correctAnswer: correctText,
            isCorrect: false,
            pdfFileName: pdfFileName || "Document officiel",
            sourceChunk: currentChallenge.sourceChunk || "",
            sourceSection: currentChallenge.sourceSection || null,
          },
        ]);
      });
    }
  }, [
    status,
    selectedOption,
    options,
    currentChallenge,
    openHeartsModal,
    startTransition,
    pdfFileName,
  ]);

  const onRetryWrong = useCallback(() => {
    // Filtrer les questions ratées et les remettre dans le quiz
    const wrongIds = answers.filter((a) => !a.isCorrect).map((_, i) => i);
    if (wrongIds.length === 0) return;
    // Pour l'instant, on recharge simplement la page
    router.refresh();
  }, [answers, router]);

  const onGoBack = useCallback(() => {
    router.push("/learn");
  }, [router]);

  // Écran de fin
  if (!currentChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col flex-1"
      >
        <Header
          hearts={hearts}
          percentage={100}
          currentQuestion={challenges.length}
          totalQuestions={challenges.length}
        />
        <ResultScreen
          totalQuestions={challenges.length}
          correctCount={correctCount}
          pointsEarned={pointsEarned}
          answers={answers}
          onRetryWrong={onRetryWrong}
          onGoBack={onGoBack}
        />
      </motion.div>
    );
  }

  return (
    <>
      <Header
        hearts={hearts}
        percentage={percentage}
        currentQuestion={activeIndex + 1}
        totalQuestions={challenges.length}
      />

      {/* Combo display */}
      <ComboDisplay combo={combo} />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0"
            >
              <h1 className="text-center text-lg font-bold text-slate-700 lg:text-start lg:text-2xl">
                {title}
              </h1>
              <div>
                <QuestionBubble question={currentChallenge.question} />
                <Challenge
                  options={options}
                  onSelect={onSelect}
                  status={status as "correct" | "wrong" | "none"}
                  selectedOption={selectedOption}
                  disabled={pending || status !== "none"}
                  type={currentChallenge.type}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer
        onCheck={status === "correct" || status === "wrong" ? onContinue : onCheck}
        status={status}
        disabled={pending || (status === "none" && selectedOption === undefined)}
        lessonId={lessonId}
        pdfFileName={pdfFileName}
        sourceChunk={currentChallenge.sourceChunk || undefined}
        sourceSection={currentChallenge.sourceSection || null}
      />
    </>
  );
};
