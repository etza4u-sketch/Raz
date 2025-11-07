import React from 'react';
import { Question } from '../types';
import { ANSWER_OPTIONS } from '../constants';

interface QuestionItemProps {
  question: Question;
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  isError: boolean;
}

const QuestionItem = React.forwardRef<HTMLDivElement, QuestionItemProps>(
  ({ question, selectedValue, onSelect, isError }, ref) => {
    return (
      <div ref={ref} className={`p-4 rounded-lg border-2 bg-slate-50/50 transition-colors duration-300 ${isError ? 'border-red-500' : 'border-slate-200'}`}>
        <p className="mb-4 text-lg text-slate-800 font-medium">
          {question.id}. {question.text}
        </p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {ANSWER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border-2 ${
                selectedValue === option.value
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

export default QuestionItem;