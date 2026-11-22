// frontend/src/pages/Home.jsx
// Landing page: Hero, Features, How it works, Built for, aur Call-to-action.

import { Link } from "react-router-dom";
import "./Home.css";

// Chhota helper component: icons ke liye same SVG settings ek jagah.
function Icon({ children }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Hero ke neeche ke 3 chhote points
const heroPoints = [
  "Invite with a room code",
  "Owner, editor and viewer roles",
  "Runs in your browser",
];

// Features ki list. Data alag rakhne se JSX chhota aur saaf rehta hai.
const features = [
  {
    icon: (
      <Icon>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </Icon>
    ),
    title: "Real-time editing",
    text: "Everyone in the room edits the same file at the same time. Changes appear instantly, without conflicts.",
  },
  {
    icon: (
      <Icon>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
    title: "Rooms with invite codes",
    text: "Create a private room and share its code. Teammates join in seconds, no setup needed.",
  },
  {
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </Icon>
    ),
    title: "Roles and permissions",
    text: "Owners manage the room, editors write code, and viewers can follow along without changing anything.",
  },
  {
    icon: (
      <Icon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </Icon>
    ),
    title: "Chat and voice",
    text: "Talk through ideas with room chat and voice, without switching to another app.",
  },
  {
    icon: (
      <Icon>
        <polygon points="5 3 19 12 5 21 5 3" />
      </Icon>
    ),
    title: "Run code instantly",
    text: "Choose a language, press Run, and see the output next to your code. Code runs in a secure sandbox.",
  },
  {
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </Icon>
    ),
    title: "Review and history",
    text: "Leave review comments on selected code, and revisit saved sessions and the room activity timeline.",
  },
];

// "How it works" ke steps
const steps = [
  {
    title: "Create a room",
    text: "Sign up, create a room and pick a programming language. You get a unique invite code.",
  },
  {
    title: "Invite your team",
    text: "Share the code with teammates. They join the room and get the role you choose.",
  },
  {
    title: "Code together",
    text: "Write, chat, talk and run code together, then save the session to revisit later.",
  },
];

// "Built for" section: kin logon ke liye useful hai
const useCases = [
  {
    title: "Pair programming",
    text: "Work through a bug or a feature with a teammate, in the same file, at the same time.",
  },
  {
    title: "Mock interviews",
    text: "Give a candidate a problem, watch them code live, and leave review comments afterwards.",
  },
  {
    title: "Study groups",
    text: "Learn together. Share a room with classmates and solve exercises as a team.",
  },
];

function Home() {
  return (
    <>
      {/* 1. Hero section */}
      <section className="hero">
        <div className="container hero-inner">
          {/* Left: text */}
          <div className="hero-text">
            <span className="hero-pill">Real-time collaborative coding</span>
            <h1>
              Write code together,{" "}
              <span className="gradient-text">in real time</span>
            </h1>
            <p className="hero-subtitle">
              Create a room, share an invite code, and build side by side with
              live editing, chat and voice. Run your code and see the output
              together.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login
              </Link>
            </div>

            <ul className="hero-points">
              {heroPoints.map((point) => (
                <li key={point}>
                  <span className="tick">✓</span> {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: editor preview (sirf design ke liye illustration) */}
          <div className="editor" aria-hidden="true">
            <div className="editor-bar">
              <span className="dot dot-1"></span>
              <span className="dot dot-2"></span>
              <span className="dot dot-3"></span>
              <span className="editor-tab">main.js</span>
            </div>

            <div className="editor-body">
              <div className="code-line">
                <span className="line-no">1</span>
                <span>
                  <span className="tok-kw">function</span>{" "}
                  <span className="tok-fn">sum</span>(a, b) {"{"}
                </span>
              </div>
              <div className="code-line">
                <span className="line-no">2</span>
                <span>
                  {"  "}
                  <span className="tok-kw">return</span> a + b;
                  <span className="cursor cursor-blue">
                    <span className="cursor-tag">You</span>
                  </span>
                </span>
              </div>
              <div className="code-line">
                <span className="line-no">3</span>
                <span>{"}"}</span>
              </div>
              <div className="code-line">
                <span className="line-no">4</span>
                <span></span>
              </div>
              <div className="code-line">
                <span className="line-no">5</span>
                <span>
                  console.<span className="tok-fn">log</span>(
                  <span className="tok-fn">sum</span>(
                  <span className="tok-num">2</span>,{" "}
                  <span className="tok-num">3</span>));
                  <span className="cursor cursor-purple">
                    <span className="cursor-tag">Teammate</span>
                  </span>
                </span>
              </div>
            </div>

            <div className="editor-output">
              <span className="output-label">Output</span>
              <span className="output-value">5</span>
            </div>

            <div className="editor-status">
              <span className="status-dot"></span> 2 online
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features section */}
      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Everything you need to code as a team</h2>
          <p className="section-subtitle">
            One workspace for writing, talking and running code together.
          </p>

          <div className="feature-grid">
            {features.map((item) => (
              <div className="feature-card" key={item.title}>
                <span className="feature-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="home-section home-section-soft">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">Get started in three simple steps.</p>

          <div className="steps-grid">
            {steps.map((item, index) => (
              <div className="step" key={item.title}>
                <span className="step-number">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Built for */}
      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Built for how developers work together</h2>
          <p className="section-subtitle">
            Whether you are learning, interviewing or shipping.
          </p>

          <div className="usecase-grid">
            {useCases.map((item) => (
              <div className="usecase" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to action */}
      <section className="container cta-wrap">
        <div className="cta-band">
          <h2>Ready to start coding together?</h2>
          <p>Create an account and open your first room in a minute.</p>
          <Link to="/register" className="btn btn-light btn-lg">
            Create your account
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;