import React, { useState } from 'react';
import { PatientDetails } from '../types';

interface PatientDetailsScreenProps {
  onContinue: (details: PatientDetails) => void;
  onBack: () => void;
}

const PatientDetailsScreen: React.FC<PatientDetailsScreenProps> = ({ onContinue, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ name, phone, email });
  };

  return (
    <div className="text-center flex flex-col items-center space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-slate-700">פרטי המטופל/ת (אופציונלי)</h2>
      <p className="max-w-2xl text-slate-600 leading-relaxed">
        ניתן למלא את הפרטים הבאים כדי לכלול אותם בדוח הסיכום. השדות אינם חובה, ואפשר להשתמש בכינוי.
      </p>
      <div className="w-full max-w-md text-right">
         <div className="mb-6 bg-slate-100 p-4 rounded-lg border border-slate-200">
            <p className="text-slate-600">שם המטפל/ת:</p>
            <p className="text-lg font-bold text-teal-700">פרופסור היפו</p>
         </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">שם או כינוי</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="ישראל ישראלי"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="050-1234567"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">דוא״ל</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="israel@example.com"
            />
          </div>
          <div className="flex justify-between items-center pt-4">
             <button
                type="button"
                onClick={onBack}
                className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
             >
                חזרה
             </button>
             <button
                type="submit"
                className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
             >
                המשך לשאלון
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientDetailsScreen;