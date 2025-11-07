
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onTestApp: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onTestApp }) => {
  return (
    <div className="text-center flex flex-col items-center space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-slate-700">ברוכים הבאים לשאלון חרדת בריאות</h2>
      <p className="max-w-2xl text-slate-600 leading-relaxed">
        שאלון זה נועד לסייע לך ולמטפל/ת שלך להבין טוב יותר את הטריגרים והדפוסים הקשורים לחרדת בריאות.
        השאלון מחולק למספר קטגוריות. אנא ענו על כל השאלות בכנות וריכוז.
      </p>
      <p className="max-w-2xl text-slate-600 leading-relaxed font-medium">
        בסיום, תוכלו לראות סיכום של תשובותיכם, אותו תוכלו להוריד או להעתיק ולשלוח למטפל/ת.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={onStart}
          className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          התחלת השאלון
        </button>
        <button
          onClick={onTestApp}
          className="bg-slate-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          בדיקת אפליקציה
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;