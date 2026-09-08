import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { CheckCircle, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Header from '../components/layout/Header';

const QuizPage = () => {
    const { internshipId, lectureId } = useParams();
    const navigate = useNavigate();
    const { auth } = useUserAuth();
    
    const [lecture, setLecture] = useState(null);
    const [indexedAnswers, setIndexedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [quizStartTime, setQuizStartTime] = useState(null);

    // Calculate derived values with null checks
    const currentQuestion = lecture?.mcqs?.[currentQuestionIndex];
    const totalQuestions = lecture?.mcqs?.length || 0;
    const answeredQuestions = Object.keys(indexedAnswers).length;

    useEffect(() => {
        const fetchLectureData = async () => {
            try {
                console.log('Fetching internship data for ID:', internshipId);
                const { data } = await api.get(`/api/users/internship-progress/${internshipId}`);
                console.log('API Response:', data);
                
                if (!data || !data.internship) {
                    console.error('Invalid API response structure:', data);
                    toast.error('Invalid internship data received');
                    setLoading(false);
                    return;
                }
                
                if (!data.internship.lectures || !Array.isArray(data.internship.lectures)) {
                    console.error('No lectures found in internship data:', data.internship);
                    toast.error('No lectures found for this internship');
                    setLoading(false);
                    return;
                }
                
                const lectures = data.internship.lectures;
                const lectureIndex = lectures.findIndex(l => l._id === lectureId);
                const foundLecture = lectures[lectureIndex];
                console.log('Looking for lecture ID:', lectureId);
                console.log('Available lectures:', data.internship.lectures.map(l => ({ id: l._id, title: l.lectureTitle })));
                
                if (foundLecture) {
                    const completedLectures = data.progress?.completedLectures || [];
                    const isPreviousComplete = lectureIndex === 0 || lectures
                        .slice(0, lectureIndex)
                        .every(lecture => completedLectures.some(item => (
                            item.lectureId?.toString() === lecture._id?.toString() && item.status === 'Completed'
                        )));
                    const lectureProgress = completedLectures.find(item => item.lectureId?.toString() === lectureId?.toString());

                    if (!isPreviousComplete) {
                        toast.error('Complete the previous lecture before taking this quiz.');
                        navigate(`/user/internship-view/${internshipId}`);
                        return;
                    }

                    if (!lectureProgress || !['Approved', 'Completed'].includes(lectureProgress.status)) {
                        toast.error('Submit the task and wait for approval before taking this quiz.');
                        navigate(`/user/internship-view/${internshipId}`);
                        return;
                    }

                    console.log('Found lecture:', foundLecture);
                    setLecture(foundLecture);
                    setQuizStartTime(Date.now());
                    setLoading(false);
                } else {
                    console.error('Lecture not found with ID:', lectureId);
                    toast.error('Lecture not found');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Quiz loading error:', error);
                toast.error('Failed to load lecture data');
                setLoading(false);
            }
        };

        if (internshipId && lectureId) {
            fetchLectureData();
        }
    }, [internshipId, lectureId, navigate]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (quizStartTime && !results) {
            interval = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - quizStartTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [quizStartTime, results]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (results) return; // Don't handle keyboard events when showing results
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePreviousQuestion();
                    break;
                case 'ArrowRight':
                case 'Enter':
                    e.preventDefault();
                    if (currentQuestionIndex < totalQuestions - 1) {
                        handleNextQuestion();
                    } else if (answeredQuestions === totalQuestions) {
                        handleSubmitQuiz(e);
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const optionIndex = parseInt(e.key) - 1;
                    if (optionIndex < currentQuestion?.options?.length) {
                        handleAnswerChange(currentQuestionIndex, optionIndex);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentQuestionIndex, totalQuestions, answeredQuestions, currentQuestion, results]);

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setIndexedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
        
        // Immediate feedback: auto-advance to next question after a brief delay
        if (questionIndex < totalQuestions - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(current => {
                    // Only advance if we are still on the question that was just answered
                    if (current === questionIndex) return current + 1;
                    return current;
                });
            }, 400);
        }
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };
    
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    
    const handleSubmitQuiz = async (e) => {
        e.preventDefault();
        const finalAnswers = {};
        lecture.mcqs.forEach((mcq, questionIndex) => {
            if (mcq._id !== undefined && indexedAnswers[questionIndex] !== undefined) {
                finalAnswers[mcq._id] = indexedAnswers[questionIndex];
            }
        });
        if (Object.keys(finalAnswers).length !== totalQuestions) {
            toast.error("Please answer all questions.");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await api.post('/api/users/submit-quiz',
                { internshipId, lectureId: lecture._id, answers: finalAnswers }
            );
            setResults({ ...data, userAnswers: indexedAnswers });
            if (data.passed) {
                toast.success(data.message || "Quiz passed!");
            } else {
                toast.error("Not quite! Try again to improve your score.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleTryAgain = () => { 
        setIndexedAnswers({}); 
        setResults(null); 
        setCurrentQuestionIndex(0);
        setTimeElapsed(0);
        setQuizStartTime(Date.now());
    };

    const handleBackToLecture = () => {
        // Check if this is opened in a new tab/window
        if (window.opener && !window.opener.closed) {
            // If opened in a new tab, close this tab and focus on the parent
            try {
                window.close();
            } catch (error) {
                // If window.close() fails (some browsers block it), navigate back
                navigate(`/user/internship-view/${internshipId}`);
            }
        } else {
            // If opened in the same tab, navigate back
            navigate(`/user/internship-view/${internshipId}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading quiz...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!lecture && !loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Not Available</h3>
                        <p className="text-red-600 mb-4">Lecture not found or quiz data unavailable</p>
                        <button 
                            onClick={handleBackToLecture}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Lecture
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (results) {
        const scorePercentage = (results.score / results.totalQuestions) * 100;
        const passed = scorePercentage >= 75;
        
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {passed ? (
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-red-600" />
                                    )}
                                </div>
                                <h3 className="font-bold text-2xl text-gray-900 mb-2">Quiz Results</h3>
                                <div className={`p-6 rounded-xl mb-6 ${passed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'}`}>
                                    <p className={`font-bold text-3xl ${passed ? 'text-green-800' : 'text-red-800'}`}>
                                        {results.score} / {results.totalQuestions} ({scorePercentage.toFixed(0)}%)
                                    </p>
                                    <p className={`text-lg mt-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                                        {passed ? "Congratulations! You passed the quiz." : "You need at least 75% to pass. Try again!"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                {passed ? (
                                    <button 
                                        onClick={handleBackToLecture} 
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        Back to Lecture
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleTryAgain} 
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <button 
                            onClick={handleBackToLecture}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            Back to Lecture
                        </button>
                        
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Quiz: {lecture.lectureTitle}</h1>
                                <p className="text-xs sm:text-sm text-gray-600">Test your understanding</p>
                            </div>
                        </div>
                    </div>
                        
                    {/* Progress indicator */}
                    <div className="mb-6 sm:mb-8">
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                             <span className="text-base sm:text-lg font-semibold text-gray-700">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                             <span className="text-base sm:text-lg font-semibold text-gray-700">{answeredQuestions}/{totalQuestions} answered</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 shadow-inner">
                             <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 sm:h-4 rounded-full transition-all duration-300" style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}></div>
                         </div>
                     </div>

                     {/* Quiz Card */}
                     <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                         {/* Question Header */}
                         <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6">
                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                 <div className="flex items-center gap-3 sm:gap-4">
                                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center">
                                         <span className="text-xl sm:text-2xl font-bold text-white">Ω</span>
                                     </div>
                                     <div className="min-w-0 flex-1">
                                         <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Quiz: {lecture.lectureTitle}</h2>
                                         <p className="text-purple-100 text-sm sm:text-base">Test your understanding</p>
                                     </div>
                                 </div>
                                 <div className="text-center sm:text-right text-white">
                                     <div className="text-xs sm:text-sm text-purple-100">Question</div>
                                     <div className="text-xl sm:text-2xl font-bold">{String(currentQuestionIndex + 1).padStart(2, '0')}/{String(totalQuestions).padStart(2, '0')}</div>
                                 </div>
                             </div>
                             
                             {/* Timer */}
                             <div className="mt-4 flex justify-center">
                                 <div className="bg-white bg-opacity-20 rounded-lg px-3 sm:px-4 py-2">
                                     <div className="text-xs sm:text-sm text-purple-100">Time Elapsed</div>
                                     <div className="text-base sm:text-lg font-bold text-white">
                                         {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Question Content */}
                         <div 
                             className="p-4 sm:p-8"
                             style={{ 
                                 userSelect: 'none',
                                 WebkitUserSelect: 'none',
                                 MozUserSelect: 'none',
                                 msUserSelect: 'none'
                             }}
                             onCopy={(e) => {
                                 e.preventDefault();
                                 toast.error("Copying is disabled for quiz questions.");
                             }}
                         >
                             <div className="mb-6 sm:mb-8">
                                 <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-4 sm:mb-6">
                                     {currentQuestionIndex + 1}. {currentQuestion.question}
                                 </h3>
                                 
                                 <div className="space-y-3 sm:space-y-4">
                                     {currentQuestion.options.map((option, optIndex) => {
                                         const inputId = `q-${currentQuestionIndex}-opt-${optIndex}`;
                                         return (
                                             <label 
                                                 key={inputId} 
                                                 htmlFor={inputId} 
                                                 className={`flex items-start p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                     indexedAnswers[currentQuestionIndex] === optIndex 
                                                         ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-500 ring-2 ring-purple-200 shadow-md' 
                                                         : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                 }`}
                                             >
                                                 <input 
                                                     type="radio" 
                                                     id={inputId} 
                                                     name={`question-${currentQuestionIndex}`} 
                                                     value={optIndex} 
                                                     onChange={() => handleAnswerChange(currentQuestionIndex, optIndex)} 
                                                     checked={indexedAnswers[currentQuestionIndex] === optIndex} 
                                                     className="h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 mt-0.5 border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0" 
                                                 />
                                                 <span className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">{option}</span>
                                             </label>
                                         );
                                     })}
                                 </div>
                             </div>
                             
                             {/* Navigation Buttons */}
                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-200">
                                 <button 
                                     type="button"
                                     onClick={handlePreviousQuestion}
                                     disabled={currentQuestionIndex === 0}
                                     className="w-full sm:w-auto px-4 sm:px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 text-sm sm:text-base"
                                 >
                                     Previous
                                 </button>
                                 
                                 <div className="w-full sm:w-auto">
                                     {currentQuestionIndex < totalQuestions - 1 ? (
                                         <button 
                                             type="button"
                                             onClick={handleNextQuestion}
                                             className="w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                                         >
                                             Next Question
                                         </button>
                                     ) : (
                                         <button 
                                             type="button"
                                             onClick={handleSubmitQuiz}
                                             disabled={submitting || answeredQuestions !== totalQuestions}
                                             className="w-full px-4 sm:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                                         >
                                             {submitting ? (
                                                 <div className="flex items-center justify-center gap-2">
                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                     Submitting...
                                                 </div>
                                             ) : (
                                                 'Submit Quiz'
                                             )}
                                         </button>
                                     )}
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Question Navigation Dots */}
                     <div className="mt-6 sm:mt-8 bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                         <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Question Navigation</h4>
                         <div className="flex flex-wrap gap-2 sm:gap-3">
                             {lecture.mcqs.map((_, index) => (
                                 <button
                                     key={index}
                                     onClick={() => setCurrentQuestionIndex(index)}
                                     className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                                         index === currentQuestionIndex
                                             ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                             : indexedAnswers[index] !== undefined
                                             ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                                             : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                                     }`}
                                 >
                                     {index + 1}
                                 </button>
                             ))}
                         </div>
                         <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                 <span>Answered</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                                 <span>Not Answered</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded"></div>
                                 <span>Current</span>
                             </div>
                         </div>
                     </div>

                     {/* Quiz Instructions */}
                     <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                         <div className="flex items-start gap-3">
                             <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                 <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                             </div>
                             <div className="min-w-0 flex-1">
                                 <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Quiz Instructions</h4>
                                 <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                                     <li>• Answer all questions to submit the quiz</li>
                                     <li>• You can navigate between questions using the Previous/Next buttons or the question numbers</li>
                                     <li>• You need at least 75% to pass the quiz</li>
                                     <li>• You can retake the quiz if you don't pass</li>
                                     <li>• Make sure to review your answers before submitting</li>
                                 </ul>
                                 
                                 <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                                     <h5 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Keyboard Shortcuts</h5>
                                     <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                                         <li>• <kbd className="bg-blue-100 px-1 rounded text-xs">←</kbd> Previous question</li>
                                         <li>• <kbd className="bg-blue-100 px-1 rounded text-xs">→</kbd> or <kbd className="bg-blue-100 px-1 rounded text-xs">Enter</kbd> Next question</li>
                                         <li>• <kbd className="bg-blue-100 px-1 rounded text-xs">1-4</kbd> Select answer option</li>
                                     </ul>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     );
 };

 export default QuizPage;
