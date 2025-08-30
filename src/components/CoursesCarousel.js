import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useI18n } from "../locale/LocaleProvider";
import "./CoursesCarousel.css";

export default function CoursesCarousel() {
  const { t } = useI18n();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data: c, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .eq("st_index", 0)
        .order("created_at", { ascending: true });
      if (cErr) console.error(cErr);

      const { data: pg, error: pErr } = await supabase.rpc("get_my_course_progress");
      if (pErr) console.error(pErr);

      if (!mounted) return;
      setCourses((c || []).slice(0, 4));
      setProgress(pg || []);
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const progressMap = useMemo(() => {
    const m = new Map();
    for (const row of progress) m.set(row.course_id, row);
    return m;
  }, [progress]);

  if (loading) return <div className="cc-loading">{t("lesson.loading")}</div>;
  if (!courses.length) return <div className="cc-empty">No courses yet.</div>;

  return (
    <section className="cc">
      <div className="cc-header">
        <h4 className="cc-title">{t("courses.available") || "Your Courses"}</h4>
        <Link to="/courses" className="cc-cta">
          <span className="cc-cta-text">See All</span>
        </Link>
      </div>

      <div className="cc-track">
        {courses.map((c) => {
          const pg = progressMap.get(c.course_id) || { percent: 0, total_lessons: 0, last_completed_index: 0 };
          const pct = Number(pg.percent || 0);
          const pctClass = pct >= 100 ? "cc-pct cc-pct--done" : "cc-pct";

          return (
            <Link
              key={c.course_id}
              to={`/course/${c.course_id}`}
              className="cc-card"
              title={`Last idx ${pg.last_completed_index || 0}/${pg.total_lessons || 0}`}
            >
              {/* Image (square via CSS) */}
              <CourseImage src={c.image_url} alt={c.title} />

              {/* Body */}
              <div className="cc-card-body">
                {/* Flexible top area: title (and optional description).
                    This grows, so the bar + meta stay at bottom */}
                <div className="cc-top">
                  <h3 className="cc-card-title">{c.title}</h3>
                  {c.description && <div className="cc-desc">{c.description}</div>}
                </div>

                {/* 2nd from bottom: progress bar */}
                <div className="cc-bar">
                  <div
                    className={`cc-bar-fill ${pct >= 100 ? "cc-bar-fill--done" : ""}`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>

                {/* Bottom row: lessons (left) + percent (right) */}
                <div className="cc-meta">
                  <div className="cc-lessons">{pg.total_lessons || 0} lessons</div>
                  <div className={pctClass}>{pct.toFixed(1)}%</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CourseImage({ src, alt }) {
  const has = !!src;
  return (
    <div className={`cc-img ${has ? "cc-img--has" : "cc-img--placeholder"}`}>
      {has ? (
        <img src={src} alt={alt || "Course image"} loading="lazy" className="cc-img-el" />
      ) : (
        <div className="cc-img-ph">No image</div>
      )}
    </div>
  );
}
