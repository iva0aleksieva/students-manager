import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SlidoPage() {
  // const { isLoggedIn, userId } = useAuth();

  // MOCKED FOR TESTING
  const isLoggedIn = true;
  const userId = "1eac9820-5e6e-4d10-6e94-08de36f40f78";

  // Initial dummy data for demonstration
  const [forumQuestions, setForumQuestions] = useState([
    {
      id: 1,
      description: "How can I improve my C# skills?",
      comments: [
        { id: 101, description: "Practice every day and build projects!" },
        { id: 102, description: "Check out the official documentation." },
      ],
    },
    {
      id: 2,
      description: "What's the best way to learn React?",
      comments: [{ id: 201, description: "Start with the official tutorial." }],
    },
    {
      id: 3,
      description: "Any tips for MSSQL performance tuning?",
      comments: [{ id: 301, description: "Look at execution plans and indexing." }],
    },
    {
      id: 4,
      description: "How do I deploy a .NET app to Azure?",
      comments: [{ id: 401, description: "Use GitHub Actions or Azure DevOps." }],
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [newComments, setNewComments] = useState({}); // Mapping questionId -> commentDescription

  // Placeholder for backend data fetching
  useEffect(() => {
    // TODO: Fetch questions from backend:
    // GET https://students-manager-dev.azurewebsites.net/api/slido?limit=20&skip=0
    // Update forumQuestions state with result
    console.log("Effect to fetch forum questions would trigger here.");
  }, []);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    // TODO: Post question to backend:
    // POST https://students-manager-dev.azurewebsites.net/api/slido/question
    // Body: { question: newQuestion }

    const tempId = Math.floor(Math.random() * 10000);
    const questionObj = {
      id: tempId,
      description: newQuestion,
      comments: [],
    };

    setForumQuestions([questionObj, ...forumQuestions]);
    setNewQuestion("");
    console.log("Post question logic would happen here.");
  };

  const handleCommentSubmit = (questionId) => {
    const commentText = newComments[questionId];
    if (!commentText || !commentText.trim()) return;

    // TODO: Post comment to backend:
    // POST https://students-manager-dev.azurewebsites.net/api/slido/comment
    // Body: { forumQuestionId: questionId, description: commentText }

    const updatedQuestions = forumQuestions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: [...q.comments, { id: Math.random(), description: commentText }],
        };
      }
      return q;
    });

    setForumQuestions(updatedQuestions);
    setNewComments({ ...newComments, [questionId]: "" });
    console.log(`Post comment logic for question ${questionId} would happen here.`);
  };

  const handleCommentChange = (questionId, text) => {
    setNewComments({ ...newComments, [questionId]: text });
  };

  return (
    <div className="slido-page" style={styles.page}>
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
                <p>Ако желаеш да зададеш въпрос, моля логни се в платформата.</p>
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
                    {question.comments &&
                      question.comments.map((comment) => (
                        <div key={comment.id} style={styles.commentItem}>
                          <p style={styles.commentText}>{comment.description}</p>
                        </div>
                      ))}
                  </div>

                  {/* Add Comment Form */}
                  <div style={{ marginTop: "15px" }}>
                    <div style={styles.inputGroup}>
                      <textarea
                        className="form-control"
                        placeholder="Write a comment..."
                        value={newComments[question.id] || ""}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        style={styles.commentInput}
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(question.id)}
                        style={styles.btnComment}
                      >
                        Post
                      </button>
                    </div>
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
  inputGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center", // Strictly prevents vertical stretching
  },
  commentInput: {
    flex: 1,
    height: "40px",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  btnComment: {
    backgroundColor: "#41b8a2",
    color: "#fff",
    height: "40px", // Match input height perfectly
    padding: "0 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap", // Prevents the button from being squished
    boxSizing: "border-box",
  },
};
