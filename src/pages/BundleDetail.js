// src/pages/BundleDetail.js
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function BundleDetail() {
  const { bundleId } = useParams();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState(null);
  const [rows, setRows] = useState([]);               // [{ order_index, course:{...} }]
  const [progressPct, setProgressPct] = useState(new Map()); // course_id -> percent
  const [firstLesson, setFirstLesson] = useState(new Map()); // course_id -> first lesson_id
  const [activeLesson, setActiveLesson] = useState(new Map()); // course_id -> active lesson_id
  const [loading, setLoading] = useState(true);

  // -------- Fetch bundle + courses + lessons + user progress --------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // 1) Bundle
      const { data: b, error: bErr } = await supabase
        .from("bundles").select("*")
        .eq("bundle_id", bundleId).single();
      if (!mounted) return;
      if (bErr) console.error(bErr);
      setBundle(b || null);

      // 2) Ordered courses in bundle
      const { data: bc, error: bcErr } = await supabase
        .from("bundle_courses")
        .select("order_index, course:courses(*)")
        .eq("bundle_id", bundleId)
        .order("order_index", { ascending: true });
      if (!mounted) return;
      if (bcErr) console.error(bcErr);
      const list = bc || [];
      setRows(list);

      const courseIds = list.map(r => r.course?.course_id || r.course?.id).filter(Boolean);
      if (courseIds.length === 0) {
        setProgressPct(new Map());
        setFirstLesson(new Map());
        setActiveLesson(new Map());
        setLoading(false);
        return;
      }

      // 3) Lessons for these courses (ordered)
      const { data: lessons, error: lErr } = await supabase
        .from("lessons")
        .select("lesson_id, course_id, order_index")
        .in("course_id", courseIds)
        .order("course_id", { ascending: true })
        .order("order_index", { ascending: true });
      if (lErr) console.error(lErr);

      // 4) User progress rows for these courses
      const { data: { user } } = await supabase.auth.getUser();
      let prog = [];
      if (user) {
        const { data: p, error: pErr } = await supabase
          .from("progress")
          .select("course_id, lesson_id, status")
          .eq("user_id", user.id)
          .in("course_id", courseIds);
        if (pErr) console.error(pErr);
        prog = p || [];
      }

      // 5) Compute pct, first, active lessons
      const pctMap = new Map();
      const firstMap = new Map();
      const activeMap = new Map();

      for (const cid of courseIds) {
        const L = (lessons || [])
          .filter(l => l.course_id === cid)
          .sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
        if (!L.length) continue;

        firstMap.set(cid, L[0].lesson_id);

        const completedSet = new Set(
          prog.filter(pr => pr.course_id === cid && pr.status === "completed")
              .map(pr => pr.lesson_id)
        );
        const doneCount = L.filter(l => completedSet.has(l.lesson_id)).length;
        pctMap.set(cid, (doneCount / L.length) * 100);

        const nextUnfinished = L.find(l => !completedSet.has(l.lesson_id));
        activeMap.set(cid, (nextUnfinished ? nextUnfinished.lesson_id : L[L.length - 1].lesson_id));
      }

      if (!mounted) return;
      setProgressPct(pctMap);
      setFirstLesson(firstMap);
      setActiveLesson(activeMap);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [bundleId]);

  // -------- Upsert "recent bundle view" for Pick Up section --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !bundleId || cancelled) return;
      await supabase.from("user_bundle_views").upsert([{
        user_id: user.id,
        bundle_id: bundleId,
        last_viewed_at: new Date().toISOString()
      }], { onConflict: "user_id,bundle_id" });
    })();
    return () => { cancelled = true; };
  }, [bundleId]);

  const courses = useMemo(() => rows.map(r => r.course).filter(Boolean), [rows]);
  const pct = (cid) => progressPct.get(cid) ?? 0;
  const isCompleted = (cid) => pct(cid) >= 99.9;

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!bundle) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <Link to="/bundles" style={{ textDecoration: "none" }}>← Back</Link>
        <h2>Bundle not found.</h2>
      </main>
    );
  }

  // visuals
  const THUMB = 96;
  const ROW_MAX = 640;
  const GAP_BELOW = 54;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <FlowStyles />
      <Link to="/home" style={{ textDecoration: "none" }}>← Back to Home</Link>

      <header style={{ display: "grid", gap: 8, marginTop: 12 }}>

        <h1 style={{ margin: 0 }}>{bundle.title || "Bundle"}</h1>
        {bundle.description && <p style={{ color: "#6b7280", marginTop: -4 }}>{bundle.description}</p>}
      </header>

      {/* Flow list */}
      <section style={{ marginTop: 16 }}>
        <div style={{ display: "grid" }}>
          {courses.map((c, i) => {
            const cid = c.course_id || c.id;
            const percent = pct(cid);
            const completed = isCompleted(cid);
            const next = courses[i + 1];
            const showConnector = !!next;
            const nextCompleted = next ? isCompleted(next.course_id || next.id) : false;

            const firstId = firstLesson.get(cid);
            const activeId = activeLesson.get(cid);

            const openActive = () => {
              if (activeId) {
                navigate(`/course/${cid}/lesson/${activeId}`, {
                  state: { fromBundleId: bundleId }
                });
              }
            };

            const startFrom1 = async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from("progress").delete()
                  .eq("user_id", user.id)
                  .eq("course_id", cid);
              }
              if (firstId) {
                navigate(`/course/${cid}/lesson/${firstId}`, {
                  state: { fromBundleId: bundleId }
                });
              }
            };

            const resumeOrAI = () => {
              if (completed) {
                navigate("/ai");
              } else if (activeId) {
                navigate(`/course/${cid}/lesson/${activeId}`, {
                  state: { fromBundleId: bundleId }
                });
              }
            };

            return (
              <div key={cid} style={{ display: "grid", justifyItems: "start" }}>
                <div style={{ width: "100%", maxWidth: ROW_MAX }}>
                  <RowCard
                    course={c}
                    thumb={THUMB}
                    percent={percent}
                    completed={completed}
                    hasStarted={percent > 0}
                    onOpenRow={openActive}
                    onStart={startFrom1}
                    onResumeOrAI={resumeOrAI}
                  />
                </div>

                {showConnector && (
                  <div style={{ width: "100%", maxWidth: ROW_MAX }}>
                    <Connector
                      height={GAP_BELOW}
                      prevCompleted={completed}
                      nextCompleted={nextCompleted}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* -------- Row: image left, title + progress (buttons BELOW the progress) -------- */
function RowCard({ course, thumb, percent, completed, hasStarted, onOpenRow, onStart, onResumeOrAI }) {
  const img = course.image_url;

  return (
    <div
      role="button"
      onClick={onOpenRow}
      style={{
        display: "grid",
        gridTemplateColumns: `${thumb}px 1fr`,
        gap: 12,
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
        padding: 10,
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
      }}
    >
      {/* Thumb */}
      <div style={{
        width: thumb,
        height: thumb,
        borderRadius: 12,
        overflow: "hidden",
        background: img ? "#000" : "linear-gradient(135deg,#e5e7eb,#f3f4f6)",
      }}>
        {img && (
          <img
            src={img}
            alt={course.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      {/* Text + progress + actions */}
      <div style={{ minWidth: 0, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>
          {course.title}
        </div>

        {/* Progress */}
        <div title={`${percent.toFixed(1)}% completed`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 8, background: "#f3f4f6", borderRadius: 6, overflow: "hidden", flex: 1 }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, percent))}%`,
                height: "100%",
                background: completed ? "#10b981" : "#111827",
                transition: "width .3s ease",
              }}
            />
          </div>
          <div style={{ minWidth: 40, textAlign: "right", fontWeight: 700, color: completed ? "#10b981" : "#111827", fontSize: 12 }}>
            {percent.toFixed(0)}%
          </div>
        </div>

        {/* Actions under progress */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 8, marginTop: 2 }}
        >
          <button onClick={onStart} style={btnLight} title="Start from Lesson 1">
            Start
          </button>

          {completed ? (
            <button onClick={onResumeOrAI} style={btnDark} title="Use AI">
              Use AI
            </button>
          ) : hasStarted ? (
            <button onClick={onResumeOrAI} style={btnDark} title="Resume">
              Resume
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- Vertical connector centered under row ---------- */
function Connector({ height, prevCompleted, nextCompleted }) {
  const bothDone = prevCompleted && nextCompleted;
  const flow = prevCompleted && !nextCompleted;

  return (
    <div style={{ position: "relative", height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="xMidYMin slice"
        aria-hidden
        style={{ display: "block" }}
      >
        <line
          x1="50" y1="0" x2="50" y2={height}
          stroke={bothDone ? "#10b981" : "#e5e7eb"}
          strokeWidth="6"
          strokeLinecap="butt"
        />
        {flow && (
          <line
            x1="50" y1="0" x2="50" y2={height}
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="butt"
            strokeDasharray="10 12"
            className="flow-anim"
          />
        )}
      </svg>
    </div>
  );
}

/* ---------- Styles ---------- */
const btnLight = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
};

const btnDark = {
  background: "#111827",
  color: "#fff",
  border: 0,
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
};

function FlowStyles() {
  return (
    <style>{`
      @keyframes dashFlow {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -40; }
      }
      .flow-anim { animation: dashFlow 1.1s linear infinite; }
    `}</style>
  );
}