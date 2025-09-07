// src/components/BundleResumeCarousel.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

/**
 * Shows a single "resume" bundle card (the bundle user is most active on).
 * If multiple bundles, choose the one with highest percent completion.
 *
 * We rely on:
 * - enrollments table with bundle_id (user's access)
 * - get_my_course_progress RPC or similar to compute percent per course; we'll compute bundle percent by averaging its courses.
 *
 * If you have a dedicated RPC to get bundle progress, replace the logic below.
 */

export default function BundleResumeCarousel() {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) { setLoading(false); return; }

      // 1) fetch bundles user is enrolled in
      const { data: enrollments, error: eErr } = await supabase
        .from("enrollments")
        .select("bundle_id")
        .eq("user_id", user.id)
        .not("bundle_id", "is", null);

      if (eErr) { console.error(eErr); setLoading(false); return; }
      const bundleIds = (enrollments || []).map(r => r.bundle_id).filter(Boolean);
      if (!bundleIds.length) { setBundle(null); setLoading(false); return; }

      // 2) for each bundle get bundle_courses and compute percent for each course
      // We'll fetch bundle_courses with course data and call an RPC get_my_course_progress for each course (if exists).
      // To keep simple and fast: fetch bundle_courses and course count; then call RPC get_my_course_progress that returns percent per course.
      const { data: bcRows } = await supabase
        .from("bundle_courses")
        .select("bundle_id, course: courses(*)")
        .in("bundle_id", bundleIds);

      // group by bundle
      const bundlesMap = new Map();
      for (const r of bcRows || []) {
        const bid = r.bundle_id;
        if (!bundlesMap.has(bid)) bundlesMap.set(bid, []);
        bundlesMap.get(bid).push(r.course);
      }

      // For each bundle calculate simple percent using progress table:
      // We'll call RPC 'get_my_course_progress' (if you have) or compute by counting progress rows per course.
      const bundleScores = [];
      for (const [bid, courses] of bundlesMap.entries()) {
        // compute percent for each course: completed lessons / total lessons
        const coursePercents = await Promise.all(courses.map(async (c) => {
          // call RPC that returns percent for course c.course_id for current user (if you have)
          const { data: p } = await supabase.rpc("get_my_course_progress_for_course", { p_course_id: c.course_id }).catch(() => ({ data: null }));
          // fallback: try simple count -- but we assume RPC present
          const percent = (p && p[0] && typeof p[0].percent !== "undefined") ? Number(p[0].percent) : 0;
          return percent;
        }));

        const avg = coursePercents.length ? (coursePercents.reduce((a,b) => a+b,0)/coursePercents.length) : 0;
        bundleScores.push({ bundle_id: bid, percent: avg, courses });
      }

      // choose best bundle by percent (highest)
      bundleScores.sort((a,b) => b.percent - a.percent);
      const top = bundleScores[0];

      // fetch full bundle row
      const { data: bundleRow } = await supabase
        .from("bundles")
        .select("*")
        .eq("bundle_id", top.bundle_id)
        .single();

      if (mounted) {
        setBundle({ ...bundleRow, percent: top.percent });
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 12 }}>Loading…</div>;
  if (!bundle) return <div style={{ padding: 12, color: "#9ca3af" }}>No active bundles.</div>;

  return (
    <div style={{
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #111827",
      background: "#05060a",
      padding: 12,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {bundle.image_url ? <img src={bundle.image_url} alt={bundle.title} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width:84,height:84,background:"#0b1220",borderRadius:8 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{bundle.title}</div>
          <div style={{ color: "#9ca3af", marginTop: 6 }}>{bundle.description}</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 8, background: "#111827", borderRadius: 8, flex: 1, overflow: "hidden" }}>
              <div style={{ width: `${Math.max(0, Math.min(100, bundle.percent || 0))}%`, height: "100%", background: "#E50914", transition: "width .25s ease" }} />
            </div>
            <div style={{ minWidth: 52, textAlign: "right", fontWeight: 700 }}>{Math.round(bundle.percent || 0)}%</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Link to={`/bundle/${bundle.bundle_id}`} style={btnPrimaryStyle}>Resume</Link>
            <Link to={`/bundle/${bundle.bundle_id}`} style={btnGhostStyle}>View</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnPrimaryStyle = {
  background: "#E50914",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
};
const btnGhostStyle = {
  background: "transparent",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #374151",
  textDecoration: "none",
  fontWeight: 700,
};
