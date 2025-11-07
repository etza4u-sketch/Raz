import React, { useState } from 'react';

const ResourcesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [thought, setThought] = useState('');
  const [alternativeThought, setAlternativeThought] = useState('');
  const [worry, setWorry] = useState('');
  const [worryPostponed, setWorryPostponed] = useState(false);

  const handleClearJournal = () => {
    setThought('');
    setAlternativeThought('');
  };

  const handlePostponeWorry = () => {
    if (worry.trim()) {
      setWorryPostponed(true);
      setWorry('');
      setTimeout(() => setWorryPostponed(false), 3000); // Hide message after 3 seconds
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-teal-800">כלים להתמודדות ותרגול</h2>
        <button
          onClick={onBack}
          className="bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
        >
          חזרה לסיכום
        </button>
      </div>

      <p className="text-slate-600">
        כלים אלו מבוססים על עקרונות של טיפול קוגניטיבי-התנהגותי (CBT) ויכולים לסייע בהתמודדות עם מחשבות ודאגות הקשורות לחרדת בריאות. התרגול הוא המפתח.
      </p>

      {/* Tool 1: Thought Journal */}
      <div className="p-6 rounded-lg border-2 border-slate-200 bg-slate-50/50">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">יומן מחשבות (מודל אפר"ת)</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          הרעיון המרכזי הוא שהרגשות שלנו לא נובעים ישירות מהאירוע, אלא מהפירוש (המחשבה) שאנחנו נותנים לו. כשאנו חווים תסמין גופני, המחשבה האוטומטית עלולה להיות קטסטרופלית ("זה בטח גידול"). תרגיל זה עוזר לזהות את המחשבה האוטומטית ולנסח מחשבה חלופית, מאוזנת ומציאותית יותר.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="thought" className="block text-sm font-medium text-slate-700 mb-1">1. מהי המחשבה האוטומטית המלחיצה?</label>
            <textarea
              id="thought"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="לדוגמה: 'כאב הראש הזה הוא סימן לגידול מוחי...'"
            />
          </div>
          <div>
            <label htmlFor="alternativeThought" className="block text-sm font-medium text-slate-700 mb-1">2. מהי מחשבה חלופית, מאוזנת יותר?</label>
            <textarea
              id="alternativeThought"
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="לדוגמה: 'כאבי ראש יכולים לנבוע מהמון סיבות כמו עייפות או התייבשות. סביר יותר שזו אחת מהן.'"
            />
          </div>
          <div className="text-left">
            <button onClick={handleClearJournal} className="text-sm text-slate-500 hover:text-slate-700">נקה יומן</button>
          </div>
        </div>
      </div>

      {/* Tool 2: Worry Postponement */}
      <div className="p-6 rounded-lg border-2 border-slate-200 bg-slate-50/50">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">דחיית דאגות</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          טכניקה זו עוזרת לשבור את מעגל הדאגות החוזרות ונשנות על ידי קביעת "זמן דאגה" מוגדר (למשל, 15 דקות כל יום ב-17:00). כשדאגה עולה במהלך היום, במקום לשקוע בה, אתה רושם אותה ומחליט לדחות את העיסוק בה לזמן הדאגה. זה מחזיר תחושת שליטה ומפחית את הזמן המוקדש לדאגות.
        </p>
        <div className="space-y-4">
            <div>
                <label htmlFor="worry" className="block text-sm font-medium text-slate-700 mb-1">1. מהי הדאגה שמטרידה אותך כרגע?</label>
                <textarea
                    id="worry"
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    rows={2}
                    placeholder="לדוגמה: 'אולי השומה הזאת היא סרטן...'"
                />
            </div>
            <div className="text-center">
                <button
                    onClick={handlePostponeWorry}
                    className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                >
                    דחה את הדאגה ל"זמן דאגה"
                </button>
            </div>
            {worryPostponed && (
                <div className="p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md text-center animate-fade-in" role="alert">
                    <p>מצוין! הדאגה נרשמה בצד ותחכה לזמן הדאגה שלך.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesScreen;