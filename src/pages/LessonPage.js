import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../locale/LocaleProvider";
import useLang from "../hooks/useLang";

const RATE_KEY = "learniq_audio_rate";
const TYPING_SPEED = 25;

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const lang = useLang();

  const [fromBundleId] = useState(() => {
    try {
      const stateVal = location.state?.fromBundleId || null;
      const queryVal = new URLSearchParams(location.search).get("fromBundleId");
      return stateVal || queryVal || null;
    } catch {
      return null;
    }
  });

  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

  // audio
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);

  // typing animation
  const [typedHtml, setTypedHtml] = useState("");

  // restore saved rate
  useEffect(() => {
    const saved = parseFloat(localStorage.getItem(RATE_KEY));
    if (!Number.isNaN(saved) && saved >= 0.5 && saved <= 1.5) setRate(saved);
  }, []);

  // fetch lessons + meta
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: list, error } = await supabase.rpc("get_course_lessons_i18n", {
        p_course_id: courseId,
        p_lang: lang,
      });
      if (!mounted) return;

      if (error) {
        console.error("RPC error:", error);
        setLessons([]); setCurrent(null); setLoading(false);
        return;
      }

      const base = Array.isArray(list) ? list : [];
      const ids = base.map(r => r.lesson_id).filter(Boolean);

      let metaMap = new Map();
      if (ids.length) {
        const { data: rows, error: metaErr } = await supabase
          .from("lessons")
          .select("lesson_id, audio, image_url, image_gif_url")
          .in("lesson_id", ids);
        if (metaErr) console.error("Fetch meta (lessons) error:", metaErr);
        for (const row of rows || []) metaMap.set(row.lesson_id, row);
      }

      const merged = base.map(r => ({ ...r, ...(metaMap.get(r.lesson_id) || {}) }));
      setLessons(merged);
      setCurrent(lessonId ? merged.find(l => l.lesson_id === lessonId) : merged[0] || null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [courseId, lessonId, lang]);

  // sync audio url with current lesson
  useEffect(() => {
    stopAudio();
    setAudioUrl(current?.audio || null);
  }, [current?.lesson_id, current?.audio]);

  // index math
  const currentIndex = useMemo(() => {
    if (!lessons || !current) return -1;
    return lessons.findIndex(l => l.lesson_id === current.lesson_id);
  }, [lessons, current]);

  const prevLessonId = currentIndex > 0 ? lessons[currentIndex - 1]?.lesson_id : null;
  const nextLessonId =
    currentIndex > -1 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1]?.lesson_id : null;

  // sanitize + typing
  const sanitizedHtml =
    current?.content_html && DOMPurify.sanitize(current.content_html, { USE_PROFILES: { html: true } });

  useEffect(() => {
    if (!sanitizedHtml) { setTypedHtml(""); return; }
    setTypedHtml("");
    let i = 0;
    const total = sanitizedHtml.length;
    const interval = setInterval(() => {
      i += 1;
      setTypedHtml(sanitizedHtml.slice(0, i));
      if (i >= total) clearInterval(interval);
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, [sanitizedHtml]);

  // audio helpers
  function ensureAudio() {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      el.addEventListener("ended", () => setPlaying(false));
      audioRef.current = el;
    }
    audioRef.current.playbackRate = rate;
    return audioRef.current;
  }
  function playAudio() {
    if (!audioUrl) return;
    const el = ensureAudio();
    if (el.src !== audioUrl) { el.src = audioUrl; el.currentTime = 0; }
    el.playbackRate = rate;
    el.play().then(() => setPlaying(true)).catch(console.error);
  }
  function stopAudio() {
    const el = audioRef.current;
    if (el) { try { el.pause(); el.currentTime = 0; } catch {} }
    setPlaying(false);
  }
  function changeRate(nextRate) {
    const clamped = Math.min(1.5, Math.max(0.5, Number(nextRate)));
    setRate(clamped);
    localStorage.setItem(RATE_KEY, String(clamped));
    if (audioRef.current) audioRef.current.playbackRate = clamped;
  }

  // navigation
  const goToLesson = (id) => {
    const query = fromBundleId ? `?fromBundleId=${fromBundleId}` : "";
    navigate(`/course/${courseId}/lesson/${id}${query}`, { state: fromBundleId ? { fromBundleId } : undefined });
  };
  const handleNext = () => { if (nextLessonId) { setDirection(1); stopAudio(); goToLesson(nextLessonId); } };
  const handleBack = () => {
    setDirection(-1); stopAudio();
    if (prevLessonId) goToLesson(prevLessonId);
    else if (fromBundleId) navigate(`/bundle/${fromBundleId}`); else navigate(`/course/${courseId}`);
  };

  if (!loading && lessons.length === 0) {
    return <main className="lesson-wrap"><p style={{ padding: 16 }}>Access denied</p></main>;
  }
  if (loading && !current) {
    return <main className="lesson-wrap"><p style={{ padding: 16 }}>Loading…</p></main>;
  }

  // decide image (static or gif when playing)
  const staticImg = current?.image_url || null;
  const gifImg = current?.image_gif_url || null;
  const imgSrc = playing && gifImg ? gifImg : staticImg;

  return (
    <main className="lesson-wrap">
      {/* Top Back Button */}
      <div className="top-back">
        <Link
          to={fromBundleId ? `/bundle/${fromBundleId}` : `/course/${courseId}`}
          state={fromBundleId ? { fromBundleId } : undefined}
          className="top-back-btn"
        >
          {fromBundleId ? "Back to Bundle" : "Back to Course"}
        </Link>
      </div>

      {imgSrc && (
        <div className="lesson-figure">
          <img src={imgSrc} alt="Lesson" />
        </div>
      )}

      {/* Tap to Speak Button */}
      <div className="speak-btn-wrapper">
        <button
          onClick={playing ? stopAudio : playAudio}
          className="speak-btn"
        >
          {playing ? "Tap To Mute" : "Tap To Speak"}
        </button>
      </div>

      {/* Speed Slider */}
      <div className="slider-wrapper">
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={rate}
          onChange={(e) => changeRate(e.target.value)}
        />
        <div className="slider-label">{rate.toFixed(1)}×</div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current?.lesson_id || "lesson"}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          custom={direction}
        >
          {typedHtml ? (
            <div className="speech-bubble" dangerouslySetInnerHTML={{ __html: typedHtml }} />
          ) : (
            <p style={{ color: "#aaa", marginTop: 12 }}>{t("lesson.noContent")}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Nav (80/20 white buttons) */}
      <div className="footer-nav">
        <div className="footer-inner">
          <button className="btn-back" onClick={handleBack}>
            {t("lesson.back")}
          </button>
          <button className="btn-next" onClick={handleNext}>
            {nextLessonId ? t("lesson.next") : t("lesson.finish")}
          </button>
        </div>
      </div>

      <style>{`
        html, body, #root { background: #000 !important; }
        .lesson-wrap {
          background: #000;
          color: #fff;
          min-height: 100vh;
          padding: 16px 16px 112px;
          box-sizing: border-box;
        }

        .top-back { max-width: 1000px; margin: 0 auto 10px; }
        .top-back-btn {
          display: inline-block;
          background: #fff;
          color: #000;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 600;
          border: 1px solid #fff;
        }

        .lesson-figure {
          width: 30%;
          height: 25vh;
          margin: 0 auto;
        }
        .lesson-figure img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .speak-btn-wrapper { width: 30%; margin: 0 auto; }
        .speak-btn {
          width: 100%;
          background: #fff;
          color: #000;
          border: 2px solid #0ff; /* neon blue border */
          box-shadow: 0 0 8px #0ff, 0 0 16px #0ff;
          padding: 10px 16px;
          border-radius: 0 0 10px 10px;
          font-weight: 700;
          cursor: pointer;
          margin-top: -4px;
        }

        .slider-wrapper { width: 30%; margin: 10px auto; text-align: center; }
        .slider-wrapper input[type=range] {
          width: 100%;
          -webkit-appearance: none;
          background: transparent;
        }
        .slider-wrapper input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          background: #fff;
          width: 16px; height: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid #000;
        }
        .slider-wrapper input[type=range]::-webkit-slider-runnable-track {
          height: 4px;
          background: #fff;
        }
        .slider-label { font-size: 13px; color: #fff; margin-top: 4px; }

        .speech-bubble {
          margin: 16px auto;
          padding: 14px 16px;
          background: #000;
          border: 2px solid #fff;
          border-radius: 16px;
          line-height: 1.6;
          max-width: 92vw;
          position: relative;
          color: #fff;
        }
        .speech-bubble::after {
          content: "";
          position: absolute;
          top: -20px;
          left: 20px;
          border-width: 10px;
          border-style: solid;
          border-color: transparent transparent #fff transparent;
        }
        .speech-bubble::before {
          content: "";
          position: absolute;
          top: -18px;
          left: 22px;
          border-width: 8px;
          border-style: solid;
          border-color: transparent transparent #000 transparent;
        }

        .footer-nav {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          background: #000;
          border-top: 1px solid #222;
          padding: 10px 12px;
          z-index: 30;
        }
        .footer-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }
        .btn-back, .btn-next {
          background: #fff;
          color: #000;
          border: none;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }
        .btn-back { flex: 0 0 20%; }
        .btn-next { flex: 0 0 80%; text-align: center; }

        @media (max-width: 768px) {
          .lesson-figure, .speak-btn-wrapper, .slider-wrapper { width: 60%; }
          .lesson-wrap { padding: 12px 12px 112px; }
        }
      `}</style>
    </main>
  );
}
