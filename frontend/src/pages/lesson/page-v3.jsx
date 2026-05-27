import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProfessionalQuizHeader from '@/components/professional/quiz-header';
import ProfessionalQuestionCard from '@/components/professional/question-card';
import ProfessionalAnswerOption from '@/components/professional/answer-option';
import ProfessionalValidationBar from '@/components/professional/validation-bar';
import ResultScreen from '@/components/lesson/result-screen';
import ExitModal from '@/components/lesson/exit-modal';
import { toast } from 'sonner';

// Mock quiz data (same as before - logic unchanged)
const mockQuestions = [
  {
    id: 1,
    question: 'Quelle est la collectivité territoriale compétente en matière de transports scolaires ?',
    options: [
      { id: 'a', text: 'La commune' },
      { id: 'b', text: 'Le département' },
      { id: 'c', text: 'La région' },
      { id: 'd', text: "L'État" },
    ],
    correctAnswer: 'c',
    explanation: 'Depuis la loi NOTRe de 2015, la région est compétente pour les transports scolaires.',
    sourceFile: 'loi-notre-2015.pdf',
    sourceSection: 'Article 15',
    difficulty: 2,
  },
  {
    id: 2,
    question: 'Quel est le mode de scrutin utilisé pour l\'élection du maire ?',
    options: [
      { id: 'a', text: 'Suffrage universel direct' },
      { id: 'b', text: 'Suffrage universel indirect' },
      { id: 'c', text: 'Élection par le conseil municipal' },
      { id: 'd', text: 'Nomination préfectorale' },
    ],
    correctAnswer: 'c',
    explanation: 'Le maire est élu par le conseil municipal parmi ses membres.',
    sourceFile: 'code-general-collectivites.pdf',
    sourceSection: 'Article L2122-4',
    difficulty: 1,
  },
  {
    id: 3,
    question: 'Quelle autorité contrôle la légalité des actes des collectivités territoriales ?',
    options: [
      { id: 'a', text: 'Le préfet' },
      { id: 'b', text: "Le ministre de l'Intérieur" },
      { id: 'c', text: "Le Conseil d'État" },
      { id: 'd', text: 'La Cour des comptes' },
    ],
    correctAnswer: 'a',
    explanation: 'Le préfet exerce le contrôle de légalité sur les actes des collectivités territoriales.',
    sourceFile: 'controle-legalite.pdf',
    sourceSection: 'Article L2131-1',
    difficulty: 2,
  },
];

/**
 * V3 Professional Quiz Page
 * Corporate legal platform aesthetic
 * Core logic preserved - only UI changed
 */
const ProfessionalQuizPage = () => {
  const navigate = useNavigate();
  
  // State management (UNCHANGED)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  // Keyboard navigation (UNCHANGED)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isAnswerChecked) return;
      
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 65;
        if (currentQuestion.options[optionIndex]) {
          setSelectedAnswer(currentQuestion.options[optionIndex].id);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isAnswerChecked, currentQuestion]);

  // Answer handlers (UNCHANGED)
  const handleAnswerSelect = (answerId) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(answerId);
    }
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore(score + 100);
      setCorrectCount(correctCount + 1);
      toast.success('Réponse correcte');
    } else {
      setHearts(Math.max(0, hearts - 1));
      setWrongAnswers([...wrongAnswers, {
        question: currentQuestion.question,
        userAnswer: currentQuestion.options.find(o => o.id === selectedAnswer)?.text,
        correctAnswer: currentQuestion.options.find(o => o.id === currentQuestion.correctAnswer)?.text,
        explanation: currentQuestion.explanation,
        sourceFile: currentQuestion.sourceFile,
      }]);
      toast.error('Réponse incorrecte');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
  };

  const handleExit = () => {
    navigate('/main/learn');
  };

  const handleViewSource = () => {
    toast.info('Consultation des sources PDF - Fonctionnalité à venir');
  };

  if (isFinished) {
    return (
      <ResultScreen
        score={correctCount}
        total={mockQuestions.length}
        points={score}
        wrongAnswers={wrongAnswers}
        onContinue={() => navigate('/main/learn')}
        onReview={() => {
          setCurrentQuestionIndex(0);
          setIsFinished(false);
          setSelectedAnswer(null);
          setIsAnswerChecked(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <ProfessionalQuizHeader
        progress={progress}
        hearts={hearts}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={mockQuestions.length}
        difficulty={currentQuestion.difficulty}
        onExit={() => setShowExitModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl space-y-6"
          >
            {/* Question */}
            <ProfessionalQuestionCard 
              question={currentQuestion.question}
              questionNumber={currentQuestionIndex + 1}
              difficulty={currentQuestion.difficulty}
              sourceSection={currentQuestion.sourceSection}
              sousTheme="Environnement Territorial"
            />

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
              {currentQuestion.options.map((option, index) => (
                <ProfessionalAnswerOption
                  key={option.id}
                  option={option}
                  index={index}
                  selected={selectedAnswer === option.id}
                  isCorrect={isAnswerChecked && option.id === currentQuestion.correctAnswer}
                  isWrong={isAnswerChecked && selectedAnswer === option.id && !isCorrect}
                  disabled={isAnswerChecked}
                  onClick={() => handleAnswerSelect(option.id)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Validation Bar */}
      <ProfessionalValidationBar
        selectedAnswer={selectedAnswer}
        isAnswerChecked={isAnswerChecked}
        isCorrect={isCorrect}
        explanation={isAnswerChecked ? currentQuestion.explanation : null}
        sourceFile={isAnswerChecked ? currentQuestion.sourceFile : null}
        onCheck={handleCheck}
        onNext={handleNext}
        onRetry={handleRetry}
        onViewSource={handleViewSource}
      />

      {/* Exit Modal */}
      <ExitModal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        onExit={handleExit}
      />
    </div>
  );
};

export default ProfessionalQuizPage;
