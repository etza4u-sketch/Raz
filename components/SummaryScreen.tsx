import React, { useState, useEffect, useMemo } from 'react';
import { Answers, Category, PatientDetails } from '../types';
import { ANSWER_OPTIONS } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface SummaryScreenProps {
  answers: Answers;
  categories: Category[];
  onStartOver: () => void;
  patientDetails: PatientDetails;
  onNavigateToResources: () => void;
}

// Helper function to calculate category score and severity
const getCategoryScoreDetails = (category: Category, answers: Answers) => {
    const questions = category.questions;
    const maxScore = questions.length * 4;
    const currentScore = questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

    let severity: 'normal' | 'medium' | 'severe' | 'critical';
    let colorClasses: { bg: string; border: string; text: string; ring: string; bar: string; };
    let label: string;

    if (percentage <= 25) {
        severity = 'normal';
        label = 'תקין';
        colorClasses = { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', ring: 'focus:ring-green-500', bar: 'bg-green-500' };
    } else if (percentage <= 50) {
        severity = 'medium';
        label = 'בינוני';
        colorClasses = { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', ring: 'focus:ring-yellow-500', bar: 'bg-yellow-500' };
    } else if (percentage <= 75) {
        severity = 'severe';
        label = 'חמור';
        colorClasses = { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800', ring: 'focus:ring-orange-500', bar: 'bg-orange-500' };
    } else {
        severity = 'critical';
        label = 'חמור ביותר';
        colorClasses = { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', ring: 'focus:ring-red-500', bar: 'bg-red-500' };
    }

    return { percentage, severity, colorClasses, label };
};

const getAnswerColor = (value: number): string => {
    switch (value) {
        case 4: return 'bg-red-100'; // תמיד
        case 3: return 'bg-orange-100'; // לעיתים קרובות
        default: return 'bg-white';
    }
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({
  answers,
  categories,
  onStartOver,
  patientDetails,
  onNavigateToResources,
}) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  const categoryScores = useMemo(() => {
    return categories.map(category => ({
        ...category,
        scoreDetails: getCategoryScoreDetails(category, answers)
    }));
  }, [categories, answers]);

  const overallScoreDetails = useMemo(() => {
    const allQuestions = categories.flatMap(c => c.questions);
     // Create a dummy category to reuse the scoring logic
    const dummyCategory: Category = { id: 0, title: 'Overall', questions: allQuestions };
    return getCategoryScoreDetails(dummyCategory, answers);
  }, [categories, answers]);


  const reportText = useMemo(() => {
    let text = `סיכום שאלון חרדת בריאות\n\n`;
    text += `מטפל/ת: פרופסור היפו\n`;
    if (patientDetails.name || patientDetails.phone || patientDetails.email) {
      text += `פרטי המטופל/ת:\n`;
      if (patientDetails.name) text += `שם: ${patientDetails.name}\n`;
      if (patientDetails.phone) text += `טלפון: ${patientDetails.phone}\n`;
      if (patientDetails.email) text += `דוא"ל: ${patientDetails.email}\n`;
    }
    text += `\n--- סיכום ציונים ---\n`;
    text += `ציון כולל: ${overallScoreDetails.percentage}% (${overallScoreDetails.label})\n\n`;
    
    categoryScores.forEach(({ title, scoreDetails }) => {
        text += `${title}: ${scoreDetails.percentage}% (${scoreDetails.label})\n`;
    });

    if (summary) {
      text += `\n--- ניתוח והמלצות AI ---\n\n${summary}\n\n`;
    }

    text += `\n--- פירוט התשובות ---\n\n`;
    categories.forEach(category => {
      text += `${category.title}\n`;
      category.questions.forEach(question => {
        const answerValue = answers[question.id];
        const answer = ANSWER_OPTIONS.find(opt => opt.value === answerValue);
        text += `${question.id}. ${question.text}\n`;
        text += `   תשובה: ${answer ? answer.text : 'לא נענה'}\n`;
      });
      text += `\n`;
    });

    text += `\n--- הערה חשובה ---\n`;
    text += `יש לזכור כי דוח זה מבוסס על ניתוח סטטיסטי של תשובותיך ואינו מהווה אבחנה רפואית. ייתכן שאינו משקף במדויק את מורכבות המצב, והוא נועד לשמש כנקודת פתיחה לשיחה עם איש מקצוע.\n`;

    return text;
  }, [answers, categories, patientDetails, summary, categoryScores, overallScoreDetails]);

  useEffect(() => {
    const generateSummary = async () => {
      setIsLoading(true);
      setError(null);
      setSummary('');

      try {
        if (!process.env.API_KEY) {
          throw new Error("API key is not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const answersText = categories
          .map(category => {
            const questionAnswers = category.questions
              .map(q => {
                const answer = ANSWER_OPTIONS.find(opt => opt.value === answers[q.id]);
                return `- ${q.text}: ${answer ? answer.text : 'לא נענה'} (ציון: ${answers[q.id]})`;
              })
              .join('\n');
            return `**${category.title}**\n${questionAnswers}`;
          })
          .join('\n\n');

        const patientInfo = `
          שם: ${patientDetails.name || 'לא צוין'}
          טלפון: ${patientDetails.phone || 'לא צוין'}
          דוא"ל: ${patientDetails.email || 'לא צוין'}
        `.trim();

        const severeOrCriticalCategoriesCount = categoryScores.filter(
          cs => cs.scoreDetails.severity === 'severe' || cs.scoreDetails.severity === 'critical'
        ).length;
      
        const shouldAddUrgentMessage = severeOrCriticalCategoriesCount >= 2 || overallScoreDetails.percentage > 75;

        let urgentMessagePrompt = '';
        if (shouldAddUrgentMessage) {
            urgentMessagePrompt = `
                הנחיה חשובה במיוחד: תוצאות השאלון מצביעות על רמת מצוקה גבוהה. 
                עליך להוסיף בסוף הניתוח שלך (אחרי המסר המסכם ולפני ההערה על הניתוח הסטטיסטי) קטע מיוחד.
                עצב את הקטע באופן בולט אך מרגיע, תחת הכותרת "### הודעה חשובה מפרופסור היפו".
                התוכן של הקטע צריך להיות זהה לטקסט הבא:
                
                "תוצאות השאלון מצביעות על רמת מצוקה הדורשת התייחסות. חשוב לי להדגיש שזהו כלי ראשוני בלבד, ואין לראות בתוצאות אלו אישור לחרדות שלך. תחושות אלו ניתנות לטיפול יעיל, והצעד הראשון שעשית במילוי השאלון הוא צעד אמיץ וחשוב בדרך להבנה והתמודדות. אני כאן כדי ללוות אותך בתהליך."
            `;
        }

        const prompt = `
          אתה "פרופסור היפו", מומחה אמפתי, מרגיע ומנוסה בטיפול בחרדת בריאות.
          המטרה שלך היא לנתח את התשובות של המשתמש/ת לשאלון חרדת בריאות ולספק סיכום אישי, תומך ומעשי בפורמט Markdown.

          הניתוח שלך צריך להיות:
          - מרגיע ולא מלחיץ.
          - מבוסס על עקרונות CBT.
          - מעשי וממוקד בצעדים ראשונים.
          - כתוב בגוף ראשון ("אני רואה ש...", "אני מציע...").

          **פרטי המטופל/ת:**
          ${patientInfo}

          **תשובות לשאלון:**
          ${answersText}
          
          **ציון כולל:** ${overallScoreDetails.percentage}% (${overallScoreDetails.label})

          **ציונים לפי קטגוריות:**
          ${categoryScores.map(cs => `- ${cs.title}: ${cs.scoreDetails.percentage}% (${cs.scoreDetails.label})`).join('\n')}

          **מבנה הניתוח המבוקש:**

          1.  **פתיחה קצרה (2-3 משפטים):** פנה למשתמש בשמו (אם קיים). הכר בתחושות שלו והדגש שהן נפוצות וניתנות לטיפול.
          2.  **זיהוי דפוסים מרכזיים (2-3 נקודות עיקריות):** סקור את התשובות והציונים, וזהה 2-3 דפוסים בולטים. אל תשתמש במונחים קליניים מדי. למשל:
              *   "שמתי לב שחיפוש מידע באינטרנט הוא נושא מרכזי שמעורר אצלך דאגה רבה."
              *   "נראה שהתמקדות בתחושות גופניות מסוימות (כמו דפיקות לב) היא טריגר משמעותי."
              *   "הצורך לקבל אישורים וביטחון מאחרים הוא דפוס שחוזר על עצמו."
          3.  **המלצות ראשוניות ומעשיות (2-3 המלצות):** ספק המלצות קונקרטיות וקלות ליישום המבוססות על CBT. לדוגמה:
              *   **המלצה 1 (לדוגמה, בנושא חיפוש באינטרנט):** "אני מציע לך להתחיל בתרגיל קטן: נסה להגביל את חיפוש התסמינים באינטרנט לפעם אחת ביום, למשך 15 דקות בלבד. הגדר טיימר. המטרה היא לא למצוא תשובה, אלא לתרגל שליטה על דחף החיפוש."
              *   **המלצה 2 (לדוגמה, בנושא בדיקות גוף):** "במקום לבדוק את גופך שוב ושוב, נסה 'לדחות' את הבדיקה ב-10 דקות. כשהדחף עולה, אמור לעצמך 'אני אבדוק בעוד 10 דקות'. ייתכן שתגלה שהדחף נחלש."
          4.  **מסר מסכם ומעודד (2-3 משפטים):** סיים בנימה חיובית. הדגש שההתמודדות היא תהליך, ושמילוי השאלון הוא צעד חשוב. עודד את המשתמש לשתף את התוצאות עם איש מקצוע.

          ${urgentMessagePrompt}

          **הערה חשובה:** סיים תמיד עם ההערה הבאה, מילה במילה:
          "---
          *הערה: יש לזכור כי ניתוח זה מבוסס על אלגוריתם סטטיסטי ואינו מהווה אבחנה רפואית. הוא נועד לשמש כנקודת פתיחה לשיחה עם איש מקצוע מוסמך.*"

          אנא כתוב את הניתוח ישירות, ללא הקדמות נוספות.
        `;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        setSummary(response.text);

      } catch (e: any) {
        console.error(e);
        if (e.message?.includes("API key not valid") || e.message?.includes("API key is not configured")) {
           setError("אירעה שגיאה באימות ולכן לא ניתן ליצור סיכום כעת. אנא ודא שהאפליקציה מוגדרת כראוי.");
        } else if (e.message?.includes("Request failed with status code 429")) {
          setError("הגעת למגבלת הבקשות. אנא נסה שוב מאוחר יותר.");
        }
        else {
           setError('אירעה שגיאה ביצירת הסיכום. אנא נסה שוב.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [answers, categories, patientDetails, categoryScores, overallScoreDetails]);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopySuccess('הדוח הועתק בהצלחה!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('העתקה נכשלה.');
    });
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const patientName = patientDetails.name || 'report';
    link.download = `health-anxiety-report-${patientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-teal-800 text-center">סיכום ותוצאות</h2>

        {/* Overall Score */}
        <div className={`p-4 rounded-lg border-l-4 ${overallScoreDetails.colorClasses.bg} ${overallScoreDetails.colorClasses.border}`}>
            <h3 className={`text-lg font-bold ${overallScoreDetails.colorClasses.text}`}>ציון כולל: ${overallScoreDetails.label} (${overallScoreDetails.percentage}%)</h3>
        </div>

        {/* Category Scores Chart */}
        <div className="p-6 rounded-lg border-2 border-slate-200 bg-white">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">פירוט ציונים לפי קטגוריה</h3>
          <div className="space-y-4">
            {categoryScores.map((score) => (
              <div key={score.id} className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm sm:text-base font-medium text-slate-700">{score.title.split(': ')[1] || score.title}</span>
                  <span className={`text-sm font-medium ${score.scoreDetails.colorClasses.text}`}>
                    {score.scoreDetails.percentage}% ({score.scoreDetails.label})
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${score.scoreDetails.colorClasses.bar} transition-all duration-1000 ease-out`}
                    style={{ width: `${score.scoreDetails.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* AI Summary Section */}
        <div className="p-6 rounded-lg border-2 border-slate-200 bg-slate-50/50">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">ניתוח והמלצות אישיות מפרופסור היפו</h3>
            {isLoading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse text-slate-600">
                    <div className="w-6 h-6 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
                    <span>מנתח את תשובותיך... (עשוי לקחת מספר שניות)</span>
                </div>
            ) : error ? (
                <div className="text-center p-4 bg-red-100 rounded-lg border border-red-300">
                    <p className="font-semibold text-red-800">שגיאה</p>
                    <p className="text-red-700 mb-4">{error}</p>
                </div>
            ) : (
                <div className="prose prose-slate max-w-none text-right" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
            )}
        </div>

         {/* Resources Navigation */}
        <div className="text-center py-4">
             <button
                onClick={onNavigateToResources}
                className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
                לתרגול וכלים להתמודדות
            </button>
        </div>


        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 border-t border-slate-200">
            <button
                onClick={handleCopyToClipboard}
                className="w-full sm:w-auto bg-slate-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
            >
                {copySuccess ? copySuccess : 'העתקת הדוח המלא'}
            </button>
            <button
                onClick={handleDownload}
                className="w-full sm:w-auto bg-slate-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
            >
                הורדת הדוח כקובץ טקסט
            </button>
            <button
                onClick={onStartOver}
                className="w-full sm:w-auto bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            >
                מילוי שאלון חדש
            </button>
        </div>
        
    </div>
  );
};

export default SummaryScreen;