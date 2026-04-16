import React, { useEffect, useRef, useState } from 'react';
import robotImage from '../assets/home/robot.png';
import './HomePage.css';

const AnimatedNumber = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        let totalMilisecondsStep = Math.abs(Math.floor(duration / end));
        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, totalMilisecondsStep);

        return () => clearInterval(timer);
    }, [value, duration]);
    return <>{count}</>;
};

function HomePage() {
    const canvasRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[];:+-*";
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#5fb1a8";
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 35);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);

            const diff = midnight - now;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="hp-container">
            <canvas ref={canvasRef} className="matrix-canvas"></canvas>

            {/* Hero Section */}
            <section className="hp-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome <br /><span>Heidelberg Materials</span></h1>
                    <p className="hero-subtitle">Elevating engineering through innovation and AI-driven logic.</p>
                </div>
                <div className="robot-container">
                    <img src={robotImage} alt="Robot Guide" className="robot-anim" />
                </div>
            </section>

            <section className="hp-section engine-zone">
                <div className="zone-header">
                    <h2 className="zone-title">Learning Core</h2>
                    <p className="zone-sub">Real-time neural progress tracking</p>
                </div>

                <div className="engine-grid">
                    {/* Box 1 */}
                    <div className="engine-box" data-tooltip="12 tasks solved this week">
                        <div className="box-top">
                            <span className="box-label">Algorithm Mastery</span>
                            <span className="box-percent"><AnimatedNumber value="75" />%</span>
                        </div>
                        <div className="box-bar">
                            <div className="box-fill" style={{ '--target-width': '75%' }}></div>
                        </div>
                        <div className="box-bottom">
                            <span className="box-context">15 tasks completed this week</span>
                            <span className="box-goal">Next: reach 80% to unlock "Coder" badge</span>
                        </div>
                    </div>

                    {/* Box 2 */}
                    <div className="engine-box" data-tooltip="Accuracy up by +5%">
                        <div className="box-top">
                            <span className="box-label">Logic Precision</span>
                            <span className="box-percent"><AnimatedNumber value="92" />%</span>
                        </div>
                        <div className="box-bar">
                            <div className="box-fill highlight" style={{ '--target-width': '92%' }}></div>
                        </div>
                        <div className="box-bottom">
                            <span className="box-context">Top 10% global accuracy</span>
                            <span className="box-goal">Target: 95% for "Flawless" status</span>
                        </div>
                    </div>

                    {/* Box 3 */}
                    <div className="engine-box" data-tooltip="Active 5-day streak!">
                        <div className="box-top">
                            <span className="box-label">Total Uptime</span>
                            <span className="box-percent"><AnimatedNumber value="124" />h</span>
                        </div>
                        <div className="box-bar">
                            <div className="box-fill gold" style={{ '--target-width': '65%' }}></div>
                        </div>
                        <div className="box-bottom">
                            <span className="box-context">Top 5% of this month</span>
                            <span className="box-goal">3h more to reach "Senior" level</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Challenge Section */}
            <section className="hp-section daily-challenge">
                <div className="mac-terminal">
                    <div className="terminal-header">
                        <div className="terminal-buttons">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="terminal-title">daily_challenge.js</div>
                    </div>

                    <div className="terminal-body">
                        <h2 className="challenge-title">Today's Mission</h2>
                        <p className="challenge-desc">Write a function to find the first non-repeating character in a string.</p>

                        <div className="code-container">
                            <code className="challenge-snippet">
                                {`function findFirstUnique(str) { 
  // Your logic here...
  return result; 
}`}
                            </code>
                        </div>

                        <div className="terminal-actions">
                            <div className="challenge-timer">
                                <span className="timer-label">TIME REMAINING:</span>
                                <span className="timer-value">{timeLeft}</span>
                            </div>
                            <button className="solve-btn">INITIALIZE SOLVE</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wall of Fame Section */}
            <section className="hp-section achievements-section">
                <h2 className="section-title">Wall of Fame</h2>
                <div className="achievements-grid">
                    <div className="achievement-card">
                        <div className="firework-container">
                            <div className="firework"></div>
                            <div className="firework"></div>
                        </div>
                        <div className="achievement-icon">🏆</div>
                        <h3>Quiz Master</h3>
                        <p>100% Score on Advanced Matrix Quiz</p>
                        <div className="student-list">
                            <span>@ivan_dev</span>
                            <span>@mary_js</span>
                            <span>@kris_tech</span>
                        </div>
                    </div>

                    <div className="achievement-card">
                        <div className="firework-container">
                            <div className="firework"></div>
                            <div className="firework"></div>
                        </div>
                        <div className="achievement-icon">🤖</div>
                        <h3>Bot Whisperer</h3>
                        <p>Successfully debugged the AI Chatbot</p>
                        <div className="student-list">
                            <span>@alex_99</span>
                            <span>@nina_codes</span>
                            <span>@george_m</span>
                        </div>
                    </div>

                    <div className="achievement-card">
                        <div className="firework-container">
                            <div className="firework"></div>
                            <div className="firework"></div>
                        </div>
                        <div className="achievement-icon">📜</div>
                        <h3>Logic Architect</h3>
                        <p>Submitted flawless Homework #4</p>
                        <div className="student-list">
                            <span>@stefan_v</span>
                            <span>@elena_b</span>
                            <span>@viktor_d</span>
                        </div>
                    </div>
                </div>
                <div className="achievements-actions">
                    <button className="hp-btn timeline-btn">View Full Timeline</button>
                </div>
            </section>

            {/* Final CTA */}
            <section className="hp-section hp-cta">
                <h2 className="hero-title" style={{ textAlign: 'center', fontSize: '3rem' }}>Ready to initialize?</h2>
                <button className="cta-main-btn">ACCESS CORE SYSTEM</button>
            </section>
        </div>
    );
}

export default HomePage;