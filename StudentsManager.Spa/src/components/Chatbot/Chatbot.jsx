import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import questionsData from '../../data/questions.json';
import { submitChatbotAnswers } from '../../services/chatbotService';
import ChatbotQuestion from './ChatbotQuestion';
import ChatbotOptions from './ChatbotOptions';
import ChatbotTextInput from './ChatbotTextInput';
import ChatbotForm from './ChatbotForm';
import { createEvent } from '../../services/eventsService';

const questions = questionsData.questions;

function Chatbot() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isTyping, setIsTyping] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const [showResultsLink, setShowResultsLink] = useState(false);
    const transitionTimer = useRef(null);
    const { userId } = useAuth();

    useEffect(() => {
        return () => {
            if (transitionTimer.current) clearTimeout(transitionTimer.current);
        };
    }, []);

    const handleTypingComplete = useCallback(() => {
        setIsTyping(false);
    }, []);

    const handleAnswer = useCallback((answerText) => {
        const current = questions[currentIndex];
        setAnswers((prev) => [
            ...prev,
            { questionId: current.id, questionText: current.text, answer: answerText }
        ]);

        // Early exit: if first question answered with "No", dismiss
        if (current.id === 'q1' && answerText === 'No') {
            setIsTyping(true);
            transitionTimer.current = setTimeout(() => {
                setIsDismissed(true);
            }, 1000);
            return;
        }

        setIsTyping(true);
        transitionTimer.current = setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 1000);
    }, [currentIndex]);

const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
        const result = await submitChatbotAnswers({
            userId,
            answers: answers.slice(1),
        });

        // ⭐ EVENT LOGGING HERE
        await createEvent({
            userId,
            type: 'chatbot',
            data: {
                answers: answers.slice(1),
                response: result,
            },
        });

        setIsComplete(true);
    } catch (err) {
        const message =
            err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            'Submission failed.';
        setSubmissionError(String(message));
    } finally {
        setIsSubmitting(false);
    }
}, [answers, userId]);
    const handleCancel = useCallback(() => {
        setIsDismissed(true);
    }, []);

    const handleShowResultsLink = useCallback(() => setShowResultsLink(true), []);

    const statusMessage = isDismissed
        ? 'No worries! Come back anytime.'
        : isComplete
            ? 'Your answers have been submitted successfully. Thank you!'
            : null;

    if (statusMessage) {
        return (
            <div className="soge-young-chatbot">
                <div className="soge-status">
                    <div className="soge-question">
                        <ChatbotQuestion
                            text={statusMessage}
                            onTypingComplete={isComplete ? handleShowResultsLink : undefined}
                        />
                    </div>
                    {isComplete && (
                        <div
                            className="soge-status-link"
                            style={{ opacity: showResultsLink ? 1 : 0 }}
                        >
                            <Link to="/chatbot/results" className="soge-btn">
                                View Results
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    return (
        <div className="soge-young-chatbot">
            <div className="soge-question">
                <ChatbotQuestion
                    key={currentIndex}
                    text={currentQuestion.text}
                    onTypingComplete={handleTypingComplete}
                />
            </div>
            <div
                className="soge-answer"
                style={{ opacity: isTyping ? 0 : 1 }}
            >
                {!isTyping && currentQuestion.type === 'options' && (
                    <ChatbotOptions
                        options={currentQuestion.options}
                        onSelect={handleAnswer}
                    />
                )}
                {!isTyping && currentQuestion.type === 'text' && (
                    <ChatbotTextInput onSubmit={handleAnswer} />
                )}
                {!isTyping && currentQuestion.type === 'finish' && (
                    <ChatbotForm
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        isSubmitting={isSubmitting}
                        error={submissionError}
                    />
                )}
            </div>
        </div>
    );
}

export default Chatbot;
