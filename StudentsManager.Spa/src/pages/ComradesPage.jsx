import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faBook } from "@fortawesome/free-solid-svg-icons";

export default function ComradesPage() {

    const [students, setStudents] = useState([]);
    const [info, setInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [hoveredStudent, setHoveredStudent] = useState(null);
    // const [homeworks, setHomeworks] = useState([]);
    // const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);

    const userIdMap = {  //нещо не ми се получаваше това да взема id-тата на студентите, защото  https://students-manager.azurewebsites.net/api/students/  не връща id-та и затова го направих така. Взех ги поотделно от Inscpector view на таблицата за страницата с Текущ контрол
        "diana.simeonova10": "01f6101c-850d-4ebb-25da-08de73b4f578",
        "damqn0322": "46bf2ef4-062b-4bd5-25d7-08de73b4f578",
        "12421385": "f9802585-0681-4aca-25dd-08de73b4f578",
        "12473587": "4fdf53bf-14e7-4238-25d9-08de73b4f578",
        "12415764": "ee498cee-3b87-47df-25db-08de73b4f578",
        "viktoria.velcheva29": "7b462780-c2a9-46b1-25d6-08de73b4f578",
        "1248905": "b8a5bdd6-ccec-44ae-25d8-08de73b4f578",
        "12414448": "68654d30-2822-45d0-25dc-08de73b4f578",
        "12485354": "f9a5a39c-a44e-4847-25de-08de73b4f578",
        "hristovd63140": "c57d2049-a4cf-4769-25df-08de73b4f578",
        "veronika.nenkova3": "11d476eb-04df-44e9-25e2-08de73b4f578",
        "1245607": "0d727847-40e6-4394-25e3-08de73b4f578",
        "12474440": "d69d9a18-4fff-40ba-b03b-08de7eb0d6c0",
        "hsyfivjk45": "??",
        "1255299": "b45a77c9-0664-4878-cca5-08de7ec4883c",
        "12462142": "a049d7ff-869d-4f5d-25e5-08de73b4f578",
        "12503660": "a6455811-b522-46c5-25e1-08de73b4f578",
        "12491569": "4b0a8a1e-db34-4c2f-25e4-08de73b4f578",
        "12478323": "542f2d9b-7852-4e41-2de4-08de783a6910",
        "vikiafif27": "0e3cfacd-7bae-4f34-cca4-08de7ec4883c",
    };

    useEffect(() => {
        fetch("https://students-manager.azurewebsites.net/api/students/", {
            headers: {
                Authorization: "Basic " + btoa("guest:guest")
            }
        })
            .then(response => response.json())
            .then(data => {
                // console.log("ALL STUDENTS DATA:", data);
                setStudents(data);
            });
    }, []);

    function showStudent(userId) {
        if (!userId) return;

        fetch("https://students-manager-dev.azurewebsites.net/api/chatbot/examination-answers/" + userId)
            .then(async (response) => {
                const text = await response.text();

                try {
                    const data = JSON.parse(text);

                    if (!Array.isArray(data) || data.length === 0) {
                        setInfo({
                            grade: "N/A",
                            feedback: "No data",
                            answers: []
                        });
                        setIsModalOpen(true);
                        return;
                    }

                    const latest = data[0];

                    let parsedForm = {};
                    try {
                        parsedForm = JSON.parse(latest.form);
                    } catch (e) {}

                    let parsedResult = [];
                    try {
                        parsedResult =
                            typeof latest.result === "string"
                                ? JSON.parse(latest.result)
                                : latest.result;

                        if (!Array.isArray(parsedResult)) {
                            parsedResult = [];
                        }
                    } catch (e) {
                        parsedResult = [];
                    }

                    setInfo({
                        grade: parsedForm.grade ?? "N/A",
                        feedback: parsedForm.overallFeedback ?? "N/A",
                        answers: parsedResult
                    });

                    setIsModalOpen(true);

                } catch (err) {
                    setInfo({
                        grade: "Error",
                        feedback: "Failed to load data",
                        answers: []
                    });
                    setIsModalOpen(true);
                }
            });
    }

    function showHomeworks(userId) {
        if (!userId) return;

        fetch("https://students-manager.azurewebsites.net/api/homeworks/" + userId)
            .then(res => res.json())
            .then(data => {
                console.log("HOMEWORKS:", data);
                setHomeworks(data);
                setIsHomeworkModalOpen(true);
            })
            .catch(err => {
                console.error("Failed to load homeworks", err);
            });
    }

    return (
        <div className="comrades-page">
            <h1>Comrades Page</h1>
            <p className="subtitle">Where all peers meet</p>

            <div className="students-grid">
                {students.map((student) => {

                    const avatarSrc = student.base64EncodePicture
                        ? student.base64EncodePicture.replace(
                            "data:image/jpeg;base64,data:image/png;base64,",
                            "data:image/png;base64,"
                        )
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(student.fullName)}`;

                    return (
                        <div
                            key={student.userName}
                            onClick={() => {
                                const newId = student.userId;
                                console.log(newId);
                                const id = userIdMap[student.userName];
                                if (!id) return;
                                setSelectedStudent(student); 
                                showStudent(id);
                            }}
                            onMouseEnter={() => setHoveredStudent(student.userName)}
                            onMouseLeave={() => setHoveredStudent(null)}
                            className="student-card"
                        >
                            <img
                                src={avatarSrc}
                                alt={student.fullName}
                                className="student-avatar"
                            />

                            <div className="student-info">
                                <div className="student-name">{student.fullName}</div>
                                <div className="student-username">@{student.userName}</div>
                                <div className="student-fn">FN: {student.facultyNumber}</div>
                                <div className="student-email">{atob(student.email)}</div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    title="Message"
                                >
                                    <FontAwesomeIcon icon={faMessage} />
                                </button>

                                {/* todo : expose new endpoint */}
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // const id = userIdMap[student.userName];
                                        // if (!id) return;
                                        // showHomeworks(id);
                                    }}
                                    title="View Homeworks"
                                >
                                    <FontAwesomeIcon icon={faBook} />
                                </button>
                            </div>

                            {/* {hoveredStudent === student.userName && (
                                <div className="tooltip">
                                    Click to view examination results
                                </div>
                            )} */}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && info && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h3>Grade: {info.grade}</h3>
                        <p><strong>Feedback:</strong> {info.feedback}</p>
                        <hr />
                        <h3>Chatbot Examination – Questions & Answers by <span className="span-name">@{selectedStudent?.userName}</span></h3>
                        {info.answers.length > 0 ? (
                            <ol>
                                {info.answers.map((a, index) => (
                                    <li key={index} style={{ marginBottom: "10px" }}>
                                        <div>
                                            <strong>Q:</strong>{" "}
                                            <strong>
                                                {a.QuestionText ||
                                                a.questionText ||
                                                a.Question ||
                                                a.question ||
                                                a.QuestionId ||
                                                "Question not available"}
                                            </strong>
                                        </div>
                                        <div>
                                            <strong>A:</strong>{" "}
                                            {a.Answer || a.answer || "N/A"}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p>No answers available.</p>
                        )}
                    </div>
                </div>
            )}

            {/* {isHomeworkModalOpen && (
                <div className="modal-overlay" onClick={() => setIsHomeworkModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <button
                            className="modal-close"
                            onClick={() => setIsHomeworkModalOpen(false)}
                        >
                            ✕
                        </button>

                        <h3>Homeworks</h3>

                        {homeworks.length > 0 ? (
                            <ul>
                                {homeworks.map((hw, index) => (
                                    <li key={index}>
                                        <strong>{hw.title || "Homework"}</strong>
                                        <p>{hw.description || "No description"}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No homeworks found.</p>
                        )}
                    </div>
                </div>
            )} */}
        </div>
    );
}