import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizHeader from '@/components/lesson/quiz-header';
import QuizFooter from '@/components/lesson/quiz-footer';
import QuestionBubble from '@/components/lesson/question-bubble';
import AnswerCard from '@/components/lesson/answer-card';
import ResultScreen from '@/components/lesson/result-screen';
import ExitModal from '@/components/lesson/exit-modal';
import ComboDisplay from '@/components/lesson/combo-display';
import { toast } from 'sonner';

// Mock quiz data
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
  },
  {
    id: 2,
    question: 'Quel est le mode de scrutin utilisé pour l’élection du maire ?',
    options: [
      { id: 'a', text: 'Suffrage universel direct' },
      { id: 'b', text: 'Suffrage universel indirect' },
      { id: 'c', text: 'Élection par le conseil municipal' },
      { id: 'd', text: 'Nomination préfectorale' },
    ],
    correctAnswer: 'c',
    explanation: 'Le maire est élu par le conseil municipal parmi ses membres.',
    sourceFile: 'code-general-collectivites.pdf',
  },
  {
    id: 3,
    question: 'Quelle autorité contrôle la légalité des actes des collectivités territoriales ?',
    options: [
      { id: 'a', text: 'Le préfet' },
      { id: 'b', text: 'Le ministre de l’Intérieur' },
      { id: 'c', text: 'Le Conseil d’État' },
      { id: 'd', text: 'La Cour des comptes' },
    ],
    correctAnswer: 'a',
    explanation: 'Le préfet exerce le contrôle de légalité sur les actes des collectivités territoriales.',
    sourceFile: 'controle-legalite.pdf',
  },
  {
    id: 4,
    question: 'Combien de régions compte la France métropolitaine depuis 2016 ?',
    options: [
      { id: 'a', text: '12 régions' },
      { id: 'b', text: '13 régions' },
      { id: 'c', text: '18 régions' },
      { id: 'd', text: '22 régions' },
    ],
    correctAnswer: 'b',
    explanation: 'La réforme territoriale de 2015 a réduit le nombre de régions métropolitaines à 13.',
    sourceFile: 'reforme-territoriale-2015.pdf',
  },
  {
    id: 5,
    question: 'Quel principe régit l’organisation territoriale française ?',
    options: [
      { id: 'a', text: 'La centralisation' },
      { id: 'b', text: 'La décentralisation' },
      { id: 'c', text: 'Le fédéralisme' },
      { id: 'd', text: 'La séparation des pouvoirs' },
    ],
    correctAnswer: 'b',
    explanation: 'La France est un État décentralisé, avec des collectivités territoriales disposant de compétences propres.',
    sourceFile: 'constitution-article-1.pdf',
  },
  {
    id: 6,
    question: 'Quelle est la durée du mandat d’un conseiller municipal ?',
    options: [
      { id: 'a', text: '4 ans' },
      { id: 'b', text: '5 ans' },
      { id: 'c', text: '6 ans' },
      { id: 'd', text: '7 ans' },
    ],
    correctAnswer: 'c',
    explanation: 'Les conseillers municipaux sont élus pour un mandat de 6 ans.',
    sourceFile: 'code-electoral.pdf',
  },
  {
    id: 7,
    question: 'Qui préside le conseil départemental ?',
    options: [
      { id: 'a', text: 'Le préfet' },
      { id: 'b', text: 'Le président du conseil départemental' },
      { id: 'c', text: 'Le doyen d’âge' },
      { id: 'd', text: 'Le maire chef-lieu' },
    ],
    correctAnswer: 'b',
    explanation: 'Le conseil départemental élit son président parmi ses membres.',
    sourceFile: 'conseil-departemental.pdf',
  },
  {
    id: 8,
    question: 'Quelle collectivité gère les collèges ?',
    options: [
      { id: 'a', text: 'La commune' },
      { id: 'b', text: 'Le département' },
      { id: 'c', text: 'La région' },
      { id: 'd', text: "L'État" },
    ],
    correctAnswer: 'b',
    explanation: 'Le département a la compétence de gestion des collèges (construction, entretien).',
    sourceFile: 'repartition-competences.pdf',
  },
  {
    id: 9,
    question: 'Quelle est la population minimale pour qu’une commune puisse avoir un conseil municipal ?',
    options: [
      { id: 'a', text: 'Aucune limite' },
      { id: 'b', text: '100 habitants' },
      { id: 'c', text: '500 habitants' },
      { id: 'd', text: '1000 habitants' },
    ],
    correctAnswer: 'a',
    explanation: 'Toutes les communes, quelle que soit leur taille, ont un conseil municipal.',
    sourceFile: 'code-general-collectivites.pdf',
  },
  {
    id: 10,
    question: 'Quel organe délibère au niveau régional ?',
    options: [
      { id: 'a', text: 'Le conseil régional' },
      { id: 'b', text: 'Le conseil de région' },
      { id: 'c', text: 'L’assemblée régionale' },
      { id: 'd', text: 'Le sénat régional' },
    ],
    correctAnswer: 'a',
    explanation: 'Le conseil régional est l’assemblée délibérante de la région.',
    sourceFile: 'organisation-regionale.pdf',
  },
];

const LessonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isAnswerChecked) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const optionIndex = parseInt(key) - 1;
        if (currentQuestion.options[optionIndex]) {
          setSelectedAnswer(currentQuestion.options[optionIndex].id);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isAnswerChecked, currentQuestion]);

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
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Show combo at milestones
      if (newCombo === 3 || newCombo === 5 || newCombo === 10) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 2000);
      }

      toast.success('Bonne réponse ! ✅');
    } else {
      setHearts(Math.max(0, hearts - 1));
      setCombo(0);
      setWrongAnswers([...wrongAnswers, {
        question: currentQuestion.question,
        userAnswer: currentQuestion.options.find(o => o.id === selectedAnswer)?.text,
        correctAnswer: currentQuestion.options.find(o => o.id === currentQuestion.correctAnswer)?.text,
        explanation: currentQuestion.explanation,
        sourceFile: currentQuestion.sourceFile,
      }]);
      toast.error('Mauvaise réponse ❌');
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

  if (isFinished) {
    return (
      <ResultScreen
        score={correctCount}
        total={mockQuestions.length}
        points={score}
        wrongAnswers={wrongAnswers}
        onContinue={() => navigate('/main/learn')}
        onReview={() => {
          // Reset quiz to review wrong answers
          setCurrentQuestionIndex(0);
          setIsFinished(false);
          setSelectedAnswer(null);
          setIsAnswerChecked(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <QuizHeader
        progress={progress}
        hearts={hearts}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={mockQuestions.length}
        onExit={() => setShowExitModal(true)}
      />

      {/* Combo Display */}
      <AnimatePresence>
        {showCombo && combo >= 3 && (
          <ComboDisplay combo={combo} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-3xl"
        >
          {/* Question */}
          <QuestionBubble question={currentQuestion.question} />

          {/* Answers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8"
          >
            {currentQuestion.options.map((option, index) => (
              <AnswerCard
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
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <QuizFooter
        selectedAnswer={selectedAnswer}
        isAnswerChecked={isAnswerChecked}
        isCorrect={isCorrect}
        onCheck={handleCheck}
        onNext={handleNext}
        onRetry={handleRetry}
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

export default LessonPage;