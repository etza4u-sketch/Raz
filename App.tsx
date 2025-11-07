import React, { useState, useCallback } from 'react';
import { AppState, Answers, PatientDetails } from './types';
import { CATEGORIES } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import PatientDetailsScreen from './components/PatientDetailsScreen';
import QuestionnaireScreen from './components/QuestionnaireScreen';
import SummaryScreen from './components/SummaryScreen';
import ResourcesScreen from './components/ResourcesScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({ name: '', phone: '', email: '' });
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});

  const handleStart = useCallback(() => {
    setAppState('patientDetails');
    setCurrentCategoryIndex(0);
    setAnswers({});
  }, []);

  const handleTestApp = useCallback(() => {
    setPatientDetails({
      name: 'בודק המערכת',
      phone: '050-0000000',
      email: 'tester@example.com',
    });

    const testAnswers: Answers = {};
    CATEGORIES.forEach(category => {
      category.questions.forEach(question => {
        const randomAnswer = Math.floor(Math.random() * 5); // 0 to 4
        testAnswers[question.id] = randomAnswer;
      });
    });
    setAnswers(testAnswers);

    setAppState('summary');
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setAppState('welcome');
  }, []);

  const handleContinueToQuestionnaire = useCallback((details: PatientDetails) => {
    setPatientDetails(details);
    setAppState('questionnaire');
  }, []);

  const handleAnswerChange = useCallback((questionId: number, value: number) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  }, []);

  const handleNextCategory = useCallback(() => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prevIndex => prevIndex + 1);
    }
  }, [currentCategoryIndex]);

  const handlePrevCategory = useCallback(() => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prevIndex => prevIndex - 1);
    }
  }, [currentCategoryIndex]);

  const handleFinish = useCallback(() => {
    setAppState('summary');
  }, []);

  const handleNavigateToResources = useCallback(() => {
    setAppState('resources');
  }, []);

  const handleBackToSummary = useCallback(() => {
    setAppState('summary');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onTestApp={handleTestApp} />;
      case 'patientDetails':
        return <PatientDetailsScreen onContinue={handleContinueToQuestionnaire} onBack={handleBackToWelcome} />;
      case 'questionnaire':
        return (
          <QuestionnaireScreen
            category={CATEGORIES[currentCategoryIndex]}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onNext={handleNextCategory}
            onPrev={handlePrevCategory}
            onFinish={handleFinish}
            currentCategoryIndex={currentCategoryIndex}
            totalCategories={CATEGORIES.length}
          />
        );
      case 'summary':
        return <SummaryScreen answers={answers} categories={CATEGORIES} onStartOver={handleStart} patientDetails={patientDetails} onNavigateToResources={handleNavigateToResources} />;
      case 'resources':
        return <ResourcesScreen onBack={handleBackToSummary} />;
      default:
        return <WelcomeScreen onStart={handleStart} onTestApp={handleTestApp} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-700">שאלון חרדת בריאות</h1>
          <p className="text-slate-600 mt-2 text-lg">כלי עזר לאבחון, טיפול, והתמודדות עם היפוכונדריה</p>
        </header>
        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>יישום זה הוא כלי עזר ואינו מהווה תחליף לייעוץ רפואי או פסיכולוגי מקצועי.</p>
          <p>&copy; 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default App;