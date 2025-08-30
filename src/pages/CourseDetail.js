// src/pages/CourseDetail.js
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useI18n } from "../locale/LocaleProvider";

export default function CourseDetail() {
  const { courseId } = useParams(); // UUID from URL
  const { t } = useI18n();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [myProgRows, setMyProgRows] = useState([]);

  const myCourseProgress = useMemo(() => {
    const row = (myProgRows || []).find((r) => r.course_id === courseId);
    if (!row) return { percent: 0, total_lessons: 0, last_completed_index: 0 };
    return row;
  }, [myProgRows, courseId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);

      // 1) fetch course
      let { data: c, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .eq("course_id", courseId)
        .single();

      if (cErr || !c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCourse(c);

      // 2) fetch lessons for this course
      const { data: l, error: lErr } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", c.course_id || c.id)
        .order("order_index", { ascending: true });

      if (!lErr) setLessons(l || []);

      // 3) fetch my progress for all courses, then pick this course
      const { data: pg, error: pErr } = await supabase.rpc("get_my_course_progress");
      if (pErr) console.error(pErr);
      setMyProgRows(pg || []);

      setLoading(false);
    };

    load();
  }, [courseId]);

  if (loading) return <div style={{ padding: 16 }}>{t("lesson.loading")}</div>;
  if (notFound) return <div style={{ padding: 16 }}>{t("course.notFound")}</div>;

  const pct = Number(myCourseProgress.percent || 0);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <Link to="/home" style={{ textDecoration: "none" }}>
        {t("course.backToCourses")}
      </Link>

      <section style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>{course.title}</h1>
            {course.description && (
              <p style={{ color: "#4b5563" }}>{course.description}</p>
            )}
          </div>
          <div style={{ minWidth: 80, textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: pct >= 100 ? "#16a34a" : "#111827" }}>
              {pct.toFixed(1)}%
            </div>
            <div style={{ width: 120, height: 8, background: "#f3f4f6", borderRadius: 6, overflow: "hidden", marginTop: 6 }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, pct))}%`,
                  height: "100%",
                  background: "#111827",
                  transition: "width .3s ease"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>
          {t("course.lessons")} ({lessons.length})
        </h2>
        <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
          {lessons.map((l) => (
            <li
              key={l.lesson_id || l.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Link
                to={`/course/${course.course_id || course.id}/lesson/${l.lesson_id || l.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{ fontWeight: 600 }}>
                  {l.order_index ? `${l.order_index}. ` : ""}{l.title}
                </div>
                {l.duration ? (
                  <div style={{ color: "#6b7280", fontSize: 14 }}>
                    Duration: {l.duration} min
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}