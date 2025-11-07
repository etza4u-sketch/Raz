import React, { useState, useEffect, useRef } from 'react';
import { Category, Answers } from '../types';
import QuestionItem from './QuestionItem';

interface QuestionnaireScreenProps {
  category: Category;
  answers: Answers;
  onAnswerChange: (questionId: number, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  currentCategoryIndex: number;
  totalCategories: number;
}

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({
  category,
  answers,
  onAnswerChange,
  onNext,
  onPrev,
  onFinish,
  currentCategoryIndex,
  totalCategories,
}) => {
  const [errors, setErrors] = useState<number[]>([]);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to top when category changes and reset errors.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrors([]);
    // Ensure refs array is ready for the new set of questions.
    questionRefs.current = questionRefs.current.slice(0, category.questions.length);
  }, [category.id]);

  const isLastCategory = currentCategoryIndex === totalCategories - 1;
  const progressPercentage = ((currentCategoryIndex + 1) / totalCategories) * 100;

  const validateAndProceed = (action: () => void) => {
    const unansweredIds = category.questions
      .filter(q => answers[q.id] === undefined)
      .map(q => q.id);

    if (unansweredIds.length > 0) {
      setErrors(unansweredIds);
      const firstErrorId = unansweredIds[0];
      const firstErrorIndex = category.questions.findIndex(q => q.id === firstErrorId);
      if (firstErrorIndex !== -1 && questionRefs.current[firstErrorIndex]) {
        questionRefs.current[firstErrorIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setErrors([]);
      action();
    }
  };

  const handleSelectAnswer = (questionId: number, value: number) => {
    onAnswerChange(questionId, value);

    // Auto-scroll to the next question
    setTimeout(() => {
      const currentQuestionIndex = category.questions.findIndex(q => q.id === questionId);
      const nextQuestionIndex = currentQuestionIndex + 1;

      if (nextQuestionIndex < category.questions.length) {
        const nextQuestionRef = questionRefs.current[nextQuestionIndex];
        if (nextQuestionRef) {
          nextQuestionRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-teal-800">{category.title}</h2>
          <span className="text-sm font-medium text-slate-500">
            קטגוריה {currentCategoryIndex + 1} מתוך {totalCategories}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md" role="alert">
            <p className="font-bold">נא לענות על כל השאלות</p>
            <p>יש לענות על השאלות המסומנות באדום לפני שמתקדמים.</p>
        </div>
      )}

      <div className="space-y-8">
        {category.questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            // FIX: The ref callback was returning a value, which is not allowed. Changed from an expression body `()` to a statement block `{}`.
            ref={el => { questionRefs.current[index] = el; }}
            question={question}
            selectedValue={answers[question.id]}
            onSelect={(value) => handleSelectAnswer(question.id, value)}
            isError={errors.includes(question.id)}
          />
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          onClick={onPrev}
          disabled={currentCategoryIndex === 0}
          className="bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          הקודם
        </button>
        {isLastCategory ? (
          <button
            onClick={() => validateAndProceed(onFinish)}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            סיום והצגת סיכום
          </button>
        ) : (
          <button
            onClick={() => validateAndProceed(onNext)}
            className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          >
            הבא
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireScreen;