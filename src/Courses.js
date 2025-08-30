// src/Courses.js
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useI18n } from "./locale/LocaleProvider";

export default function Courses() {
  const { t } = useI18n();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);

      // 1) courses (discoverability policy allows all auth users)
      const { data: c, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });
      if (cErr) console.error(cErr);

      // 2) progress for current user (RPC)
      const { data: pg, error: pErr } = await supabase.rpc("get_my_course_progress");
      if (pErr) console.error(pErr);

      if (!mounted) return;
      setCourses(c || []);
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

  if (loading) return <div style={{ padding: 16 }}>{t("lesson.loading")}</div>;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{t("courses.available") || "Available Courses"}</h2>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {courses.map((c) => {
          const pg = progressMap.get(c.course_id) || { percent: 0, total_lessons: 0, last_completed_index: 0 };
          const pct = Number(pg.percent || 0);
          return (
            <Link
              key={c.course_id || c.id}
              to={`/course/${c.course_id || c.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>{c.title}</h3>
                <div
                  style={{
                    minWidth: 48,
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: 16,
                    color: pct >= 100 ? "#16a34a" : "#111827"
                  }}
                  title={`Last idx ${pg.last_completed_index || 0}/${pg.total_lessons || 0}`}
                >
                  {pct.toFixed(1)}%
                </div>
              </div>

              {c.description && (
                <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.4 }}>
                  {c.description}
                </div>
              )}

              {/* micro progress bar */}
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, pct))}%`,
                    height: "100%",
                    background: "#111827",
                    transition: "width .3s ease"
                  }}
                />
              </div>

              {/* tiny meta */}
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {pg.total_lessons || 0} lessons
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}