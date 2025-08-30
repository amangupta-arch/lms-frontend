import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate("/auth?mode=signup");

  return (
    <>
      {/* ===== Hero ===== */}
      <div className="landing">
        <div className="landing-content">
          <div className="badge">
            <div className="badge-chip">AI</div>
            <p className="badge-text">EnterAI</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="badge-arrow" viewBox="0 0 16 16">
              <path
                d="M10.783 7.333 7.207 3.757l.942-.943L13.335 8l-5.186 5.185-.942-.943 3.576-3.576H2.668V7.333h8.115Z"
                fill="#5653FE"
              />
            </svg>
          </div>

          <h1 className="hero-title">
            Become the <br className="lg-only" /> Master of AI
          </h1>

          <p className="hero-subtitle">
            Learn how AI can increase your income and improve your life
          </p>

          <button type="button" className="cta" onClick={goSignup}>
            <span className="cta-text">Start Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="cta-arrow" viewBox="0 0 24 24">
              <path
                d="M16.375 12.065c0 .232-.082.43-.267.608l-5.332 5.216a.753.753 0 0 1-.553.225.786.786 0 0 1-.8-.793c0-.219.096-.417.24-.567l4.812-4.69-4.813-4.689a.824.824 0 0 1-.24-.574c0-.445.356-.786.8-.786.22 0 .404.075.554.225l5.332 5.216a.83.83 0 0 1 .267.609Z"
                fill="#fff"
              />
            </svg>
          </button>

          <div className="social-proof">
            <div className="avatar-stack">
              <img alt="EnterAI user" className="avatar" src="www.example.com/img/eg.jpg" />
              <img alt="EnterAI user" className="avatar" src="www.example.com/img/eg.jpg" />
              <img alt="EnterAI user" className="avatar" src="www.example.com/img/eg.jpg" />
            </div>
            <p className="joined-text">More than 1,056,372+ people joined</p>
          </div>
        </div>

        <div className="landing-image">
          <img src="www.example.com/img/eg.jpg" alt="AI Learning" width="600" height="600" />
        </div>
      </div>

      {/* ===== Customer Review Slideshow ===== */}
      <CustomerReviews />

      {/* ===== Split Feature Section ===== */}
      <FeatureSplit />

      {/* ===== Metrics Section ===== */}
      <Metrics />

      {/* ===== Footer ===== */}
      <SiteFooter />
    </>
  );
}

/* ---------------- Customer Reviews (Slider) ---------------- */
function CustomerReviews() {
  const reviews = [
    { name: "Suman", location: "Patna", text: "EnterAI made complex topics simple. The lessons are short and super practical.", rating: 5 },
    { name: "Ayesha", location: "Indore", text: "Loved the bite-sized format. I could learn daily even with a busy schedule.", rating: 5 },
    { name: "Ravi", location: "Surat", text: "The Hindi support helped me start quickly. I’m more confident at work now.", rating: 4 },
  ];

  const [index, setIndex] = useState(0);
  const len = reviews.length;
  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);
  const goTo = (i) => setIndex(i);

  return (
    <section className="reviews">
      <div className="reviews-header">
        <h2 className="reviews-title">What our customers say</h2>
        <p className="reviews-subtitle">Real stories from EnterAI learners</p>
      </div>

      <div className="reviews-viewport" style={{ "--slide-index": index }}>
        <button className="reviews-nav prev" onClick={prev} type="button">‹</button>
        <div className="reviews-track">
          {reviews.map((r, i) => (
            <article key={i} className="review-card">
              <div className="review-stars">{"★".repeat(r.rating)}<span className="stars-dim">{"★".repeat(5 - r.rating)}</span></div>
              <p className="review-text">“{r.text}”</p>
              <div className="review-author">
                <img className="review-avatar" src="www.example.com/img/eg.jpg" alt={`${r.name}`} />
                <div className="review-meta">
                  <span className="review-name">{r.name}</span>
                  <span className="review-location">{r.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button className="reviews-nav next" onClick={next} type="button">›</button>
      </div>

      <div className="reviews-dots">
        {reviews.map((_, i) => (
          <button key={i} className={`dot ${i === index ? "active" : ""}`} onClick={() => goTo(i)} type="button" />
        ))}
      </div>
    </section>
  );
}

/* ---------------- Split Feature Section ---------------- */
function FeatureSplit() {
  return (
    <section className="feature">
      <div className="feature-media">
        <img src="www.example.com/img/eg.jpg" alt="EnterAI preview" width="600" height="600" />
      </div>
      <div className="feature-text">
        <h3 className="feature-title">Your daily AI advantage</h3>
        <p className="feature-subtitle">Master practical workflows that save hours each week—no prior experience required.</p>
        <ul className="feature-list">
          <li><span className="bullet">✓</span> Build smarter prompts that get better results</li>
          <li><span className="bullet">✓</span> Automate repetitive tasks in minutes</li>
          <li><span className="bullet">✓</span> Apply AI to content, research, and data</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Metrics Section ---------------- */
function Metrics() {
  return (
    <section className="metrics" id="metrics">
      <div className="metrics-header">
        <h2 className="metrics-title">EnterAI in action</h2>
        <p className="metrics-subtitle">
          See how EnterAI empowers learners: our success in numbers
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <p className="metric-big">1,056k+</p>
          <p className="metric-sub">1,056,559</p>
          <p className="metric-label">Users learned new skills</p>
        </div>
        <div className="metric">
          <p className="metric-big">8,756k+</p>
          <p className="metric-sub">8,756,868</p>
          <p className="metric-label">Minutes of content consumed</p>
        </div>
        <div className="metric">
          <p className="metric-big">109k+</p>
          <p className="metric-sub">109,308</p>
          <p className="metric-label">AI prompts written</p>
        </div>
      </div>

      <div className="metrics-map">
        <img src="www.example.com/img/eg.jpg" alt="Metrics Map" />
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function SiteFooter() {
  return (
    <div className="footer-wrap">
      <footer className="footer" id="footer">
        {/* Top row: logo + store badges (desktop) */}
        <div className="footer-top desktop-only">
          <div className="footer-logo">EnterAI</div>
          <div className="footer-stores">
            <a href="www.example.com/" target="_blank" rel="noreferrer">
              <img src="www.example.com/img/eg.jpg" alt="Download on App Store" />
            </a>
            <a href="www.example.com/" target="_blank" rel="noreferrer">
              <img src="www.example.com/img/eg.jpg" alt="Download on Google Play" />
            </a>
          </div>
        </div>

        {/* Middle row: links + disclaimer */}
        <div className="footer-mid">
          <div className="footer-links">
            <div className="footer-col">
              <h5>EnterAI</h5>
              <ul>
                <li><a href="www.example.com" target="_blank">Home</a></li>
                <li><a href="www.example.com/" target="_blank">Blog</a></li>
                <li><a href="www.example.com/" target="_blank">Support center</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <ul>
                <li><a href="www.example.com/" target="_blank">Privacy policy</a></li>
                <li><a href="www.example.com/" target="_blank">Terms and conditions</a></li>
                <li><a href="www.example.com/" target="_blank">Subscription terms</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-disclaimer">
            <h5>Disclaimer</h5>
            <p>
              EnterAI as an educational platform does not provide any financial or career advice.
              Please consult with your financial or career advisor first before making any career
              decisions. There is no bias towards or against any stocks or companies mentioned here.
            </p>
          </div>
        </div>

        {/* Mobile store badges */}
        <div className="footer-mobile-stores mobile-only">
          <a href="www.example.com" target="_blank" rel="noreferrer">
            <img src="www.example.com/img/eg.jpg" alt="Download on App Store" />
          </a>
          <a href="www.example.com" target="_blank" rel="noreferrer">
            <img src="www.example.com/img/eg.jpg" alt="Download on Google Play" />
          </a>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom">
          <p>EnterAI. All rights reserved. © 2025. SCORPIOS-TECH FZO, Dubai, United Arab Emirates</p>
        </div>
      </footer>
    </div>
  );
}