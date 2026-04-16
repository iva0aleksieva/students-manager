import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { baseUrl } from "../services/apiConfig";

export default function SlidoPage() {
  // const { isLoggedIn, userId } = useAuth();

  // MOCKED FOR TESTING
  const isLoggedIn = true;
  const userId = "1eac9820-5e6e-4d10-6e94-08de36f40f78";

  const [forumQuestions, setForumQuestions] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const [newQuestion, setNewQuestion] = useState("");
  const [newComments, setNewComments] = useState({}); // Mapping questionId -> commentDescription
  const [commentErrors, setCommentErrors] = useState({}); // Mapping questionId -> error message

  // Placeholder for backend data fetching
  // GET заявка към API — зарежда всички въпроси при отваряне на страницата
  useEffect(() => {
    // TODO: Fetch questions from backend:
    // GET https://students-manager-dev.azurewebsites.net/api/slido?limit=20&skip=0
    // Update forumQuestions state with result

    // Изпращаме GET заявка към /api/slido с параметри за максимален брой резултати
    fetch(`${baseUrl}/slido?limit=20&skip=0`)
      .then((res) => res.json()) // Преобразуваме отговора в JSON
      .then((data) => {
        // Преобразуваме данните от API формат към вътрешния формат на компонента
        const mapped = data.map((q) => ({
          id: q.forumQuestionId,                // ID на въпроса
          description: q.forumQuestionDescription, // Текст на въпроса
          // Коментарите идват като масив от стрингове — превръщаме ги в обекти с id и description
          comments: (q.comments ?? []).map((text, i) => ({ id: i, description: text })),
        }));
        setForumQuestions(mapped); // Записваме въпросите в state-а
        setLoadingComments(false); // Скончваме loading state
      })
      .catch((err) => {
        console.error("Failed to fetch forum questions", err);
        setLoadingComments(false);
      });
  }, []); // Празен масив — изпълнява се само веднъж при зареждане

  const handleQuestionSubmit = (e) => {
    e.preventDefault(); // Спираме стандартното презареждане на формата
    if (!newQuestion.trim()) return; // Не изпращаме ако полето е празно

    // TODO: Post question to backend:
    // POST https://students-manager-dev.azurewebsites.net/api/slido/question
    // Body: { question: newQuestion }

    // POST заявка към /api/slido/question — създава нов въпрос в базата
    fetch(`${baseUrl}/slido/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Указваме че изпращаме JSON
      body: JSON.stringify({ question: newQuestion }), // Тялото на заявката
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to post question");
        // След успешен POST, правим нов GET за да заредим актуалния списък с реални ID-та
        return fetch(`${baseUrl}/slido?limit=20&skip=0`);
      })
      .then((res) => res.json()) // Преобразуваме отговора в JSON
      .then((data) => {
        // Същото мапване като в useEffect
        const mapped = data.map((q) => ({
          id: q.forumQuestionId,
          description: q.forumQuestionDescription,
          comments: (q.comments ?? []).map((text, i) => ({ id: i, description: text })),
        }));
        setForumQuestions(mapped); // Обновяваме списъка с реални данни
        setNewQuestion(""); // Изчистваме полето
      })
      .catch((err) => console.error(err));
  };

  const handleCommentSubmit = (questionId) => {
    const commentText = newComments[questionId];
    if (!commentText || !commentText.trim()) {
      setCommentErrors({ ...commentErrors, [questionId]: "Please enter a comment" });
      return;
    }
    // Clear error if comment is valid
    setCommentErrors({ ...commentErrors, [questionId]: "" });

    fetch(`${baseUrl}/slido/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forumQuestionId: questionId, description: commentText }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to post comment");
        setForumQuestions(forumQuestions.map((q) =>
          q.id === questionId
            ? { ...q, comments: [...q.comments, { id: Math.random(), description: commentText }] }
            : q
        ));
        setNewComments({ ...newComments, [questionId]: "" });
      })
      .catch((err) => console.error(err));
  };

  const handleCommentChange = (questionId, text) => {
    setNewComments({ ...newComments, [questionId]: text });
    // Clear error when user starts typing
    if (commentErrors[questionId]) {
      setCommentErrors({ ...commentErrors, [questionId]: "" });
    }
  };

  return (
    <div className="slido-page" style={styles.page}>
      <style>{`
        .btn-primary:hover {
          background-color: #2d8570 !important;
        }

        .panel {
          cursor: default;
        }

        .media-block, .commentsSection, .questionText, .mediaHeading {
          cursor: default;
          pointer-events: none;
        }
        
        .inputGroup, .inputGroup * {
          pointer-events: auto;
        }
        
        .btn-primary, .comment-post-button {
          cursor: pointer !important;
        }
        
        .comment-input-error {
          border-color: #e74c3c !important;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 5px;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-right: 5px;
        }
        
        .loading-text {
          color: #41b8a2;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
      <div className="container" style={styles.container}>
        <header style={styles.headerSection}>
          <h1 style={styles.title}>Forum & Discussion</h1>
          <p style={styles.subtitle}>Ask questions and share your thoughts with the community</p>
        </header>

        {/* Add Forum Question Section */}
        <div style={styles.questionFormSection}>
          {isLoggedIn ? (
            <div className="panel" style={styles.panel}>
              <div className="panel-body" style={styles.panelBody}>
                <h3 style={styles.cardTitle}>Ask a Question</h3>
                <form onSubmit={handleQuestionSubmit}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Share with us your concerns :)"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    style={styles.formControl}
                  ></textarea>
                  <div className="mar-top clearfix" style={{ marginTop: "15px" }}>
                    <button
                      className="btn btn-sm btn-primary pull-right"
                      type="submit"
                      style={styles.btnPrimary}
                    >
                      Share Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="panel" style={styles.panel}>
              <div className="panel-body" style={styles.panelBody}>
                <p>To ask a question, please log into the platform.</p>
              </div>
            </div>
          )}
        </div>

        {/* Forum Questions List (Vertical) */}
        <div style={styles.questionsListSection}>
          {forumQuestions.map((question) => (
            <div key={question.id} className="panel" style={styles.panel}>
              <div className="panel-body" style={styles.panelBody}>
                <div className="media-block" style={styles.mediaBlock}>
                  <img
                    className="img-circle img-sm"
                    alt="Profile"
                    src="https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
                    style={styles.imgSm}
                  />
                  <div className="media-body" style={styles.mediaBody}>
                    <div className="mar-btm" style={{ marginBottom: "5px" }}>
                      <span style={styles.mediaHeading}>Student {question.id}</span>
                    </div>
                    <p style={styles.questionText}>{question.description}</p>
                  </div>
                </div>

                <div style={styles.commentsSection}>
                  <h4 style={styles.commentsTitle}>Comments</h4>
                  <div style={styles.commentsList}>
                    {loadingComments ? (
                      <div className="loading-text">
                        <span className="loading-spinner">⏳</span>
                        Loading comments...
                      </div>
                    ) : question.comments && question.comments.length > 0 ? (
                      question.comments.map((comment) => (
                        <div key={comment.id} style={styles.commentItem}>
                          <p style={styles.commentText}>{comment.description}</p>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noCommentsText}>No comments yet</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div style={{ marginTop: "15px" }}>
                    <div style={styles.inputGroup}>
                      <textarea
                        className={`form-control ${commentErrors[question.id] ? "comment-input-error" : ""}`}
                        placeholder="Write a comment..."
                        value={newComments[question.id] || ""}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        style={styles.commentInput}
                        rows={2}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-primary pull-right"
                        onClick={() => handleCommentSubmit(question.id)}
                        style={styles.btnComment}
                      >
                        Post
                      </button>
                    </div>
                    {commentErrors[question.id] && (
                      <div className="error-message">{commentErrors[question.id]}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    flex: "1 0 auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ebeef0",
    paddingTop: "120px",
    paddingBottom: "50px",
    color: "#333",
    boxSizing: "border-box",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 15px",
    width: "100%",
  },
  headerSection: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
  },
  questionFormSection: {
    marginBottom: "30px",
  },
  questionsListSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  panel: {
    background: "#fff",
    border: "0",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  panelBody: {
    padding: "30px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
  },
  formControl: {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "none",
    fontFamily: "inherit",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  formControlFocus: {
    borderColor: "#41b8a2",
    boxShadow: "0 0 0 3px rgba(65, 184, 162, 0.1)",
  },
  btnPrimary: {
    backgroundColor: "#41b8a2",
    color: "#fff",
    padding: "10px 25px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    float: "right",
  },
  mediaBlock: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  imgSm: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  mediaBody: {
    flex: 1,
  },
  mediaHeading: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  questionText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#34495e",
  },
  commentsSection: {
    paddingTop: "10px",
  },
  commentsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    padding: "12px 15px",
    borderRadius: "8px",
    borderLeft: "3px solid #41b8a2",
  },
  commentText: {
    fontSize: "14px",
    color: "#576574",
    margin: 0,
  },
  noCommentsText: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    margin: 0,
    padding: "20px 0",
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    minHeight: "70px",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#fafafa",
    resize: "vertical",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  btnComment: {
    backgroundColor: "#41b8a2",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(65, 184, 162, 0.2)",
  },
};
