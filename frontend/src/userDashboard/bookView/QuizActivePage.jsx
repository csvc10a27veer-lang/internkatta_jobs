import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizActivePage = ({
    quizResults,
    quizData,
    currentQuestionIndex,
    autoAdvanceCountdown,
    quizAnswers,
    quizSubmitting,
    handleQuizAnswerChange,
    handlePreviousQuestion,
    handleCloseQuiz,
    handleNextQuestion,
    handleSubmitQuiz,
    handleTryAgain
}) => {
    return (
        <div className="relative h-full w-full bg-white shadow-lg overflow-y-auto overflow-x-hidden">
            {quizResults ? (
                // Quiz Results
                <div className="text-center p-4 sm:p-6 md:p-8">
                    <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-lg ${quizResults.passed ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-red-100 to-pink-100'}`}>
                        {quizResults.passed ? (
                            <CheckCircle className="h-10 w-10 md:h-12 md:w-12 text-green-600" />
                        ) : (
                            <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-red-600" />
                        )}
                    </div>
                    <h3 className="font-bold text-2xl md:text-4xl text-gray-900 mb-4 md:mb-6">Quiz Results</h3>
                    <div className={`p-4 sm:p-6 md:p-8 rounded-2xl mb-6 md:mb-8 shadow-lg ${quizResults.passed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'}`}>
                        <p className={`font-bold text-4xl md:text-5xl ${quizResults.passed ? 'text-green-800' : 'text-red-800'}`}>
                            {quizResults.score} / {quizResults.totalQuestions}
                        </p>
                        <p className={`text-xl md:text-2xl mt-2 ${quizResults.passed ? 'text-green-700' : 'text-red-700'}`}>
                            ({Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%)
                        </p>
                        <p className={`text-lg md:text-xl mt-4 ${quizResults.passed ? 'text-green-700' : 'text-red-700'}`}>
                            {quizResults.passed ? "Congratulations! You passed the quiz." : "You need at least 75% to pass. Try again!"}
                        </p>
                    </div>
                    
                    <div className="flex gap-4 justify-center flex-wrap">
                        {quizResults.passed ? (
                            <button 
                                onClick={handleCloseQuiz} 
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 md:px-10 md:py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-base md:text-lg"
                            >
                                Continue Reading
                            </button>
                        ) : (
                            <button 
                                onClick={handleTryAgain} 
                                className="bg-gradient-to-r from-[#0052A3] to-[#004080] text-white font-semibold px-6 py-3 md:px-10 md:py-4 rounded-lg hover:from-[#004080] hover:to-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-base md:text-lg"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                // Quiz Questions
                <div className="h-full flex flex-col">
                    {/* Quiz Header Frame */}
                    <div className="bg-gradient-to-r from-[#0052A3] to-[#004080] px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-white flex-shrink-0 relative">
                        <button 
                            onClick={handleCloseQuiz}
                            className="absolute top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 text-white hover:text-[#cce0f5] transition-colors p-1.5 bg-white/10 rounded-full hover:bg-white/20"
                            aria-label="Close Quiz"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-start gap-3 pr-10">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-xl font-bold leading-tight break-words">
                                    Quiz: {quizData?.lectureTitle}
                                </h2>
                                <p className="text-[#cce0f5] text-sm mt-1">Test your understanding</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quiz Content */}
                    <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto flex flex-col">
                        {/* Quiz Question */}
                        {quizData?.mcqs?.[currentQuestionIndex] && (
                            <div 
                                className="flex-1 flex flex-col"
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
                                <div className="mb-6 md:mb-8">
                                    <div className="flex items-start gap-3 mb-4 md:mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-[#0052A3] to-[#004080] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white font-bold text-sm">{currentQuestionIndex + 1}</span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug break-words">
                                            {quizData.mcqs[currentQuestionIndex].question}
                                        </h3>
                                    </div>
                                </div>
                                
                                {/* Auto-advance countdown */}
                                {autoAdvanceCountdown > 0 && (
                                    <div className="mb-4 p-3 bg-[#e6f0fa] border border-[#b3d1f0] rounded-lg">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0052A3]"></div>
                                            <span className="text-[#004080] font-medium text-sm sm:text-base">
                                                Next question in {autoAdvanceCountdown} second{autoAdvanceCountdown !== 1 ? 's' : ''}...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-3 mb-6 md:mb-8 flex-1">
                                    {quizData.mcqs[currentQuestionIndex].options.map((option, optIndex) => (
                                        <label 
                                            key={optIndex}
                                            className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                                                quizAnswers[currentQuestionIndex] === optIndex 
                                                    ? 'bg-[#e6f0fa] border-[#0052A3] shadow-sm' 
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name={`question-${currentQuestionIndex}`} 
                                                value={optIndex} 
                                                onChange={() => handleQuizAnswerChange(currentQuestionIndex, optIndex)} 
                                                checked={quizAnswers[currentQuestionIndex] === optIndex} 
                                                className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0 border-gray-300 text-[#0052A3] focus:ring-[#0052A3]" 
                                            />
                                            <span className="text-gray-800 font-medium leading-tight break-words flex-1">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            
                                {/* Navigation */}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                                    <button 
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-3 sm:px-6 py-2 sm:py-3 text-[#0052A3] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                    >
                                        <span className="hidden sm:inline">Previous</span>
                                        <span className="sm:hidden">‹ Prev</span>
                                    </button>
                                    
                                    <div className="text-sm sm:text-base font-medium text-gray-500">
                                        <span className="hidden sm:inline">Question </span>{currentQuestionIndex + 1} of {quizData?.mcqs?.length || 0}
                                    </div>
                                    
                                    {currentQuestionIndex < (quizData?.mcqs?.length || 0) - 1 ? (
                                        <button 
                                            onClick={handleNextQuestion}
                                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#0052A3] to-[#004080] text-white rounded-lg hover:from-[#004080] hover:to-[#003366] font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                        >
                                            <span className="hidden sm:inline">Next Question</span>
                                            <span className="sm:hidden">Next ›</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleSubmitQuiz}
                                            disabled={quizSubmitting || Object.keys(quizAnswers).length !== (quizData?.mcqs?.length || 0)}
                                            className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 text-sm sm:text-base flex items-center"
                                        >
                                            {quizSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span className="hidden sm:inline">Submitting...</span>
                                                </div>
                                            ) : (
                                                'Submit'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
