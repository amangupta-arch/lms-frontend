import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Streak7() {
  const [rows, setRows] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: w, error: wErr } = await supabase.rpc("get_my_activity_window", { p_days: 7 });
      const { data: s, error: sErr } = await supabase.rpc("get_my_current_streak");
      if (!mounted) return;
      if (wErr) console.error(wErr);
      if (sErr) console.error(sErr);
      setRows(w || []);
      setStreak(s || 0);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 8 }}>Loading streak…</div>;

  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Current streak: {streak} {streak === 1 ? "day" : "days"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {rows.map((r) => (
          <div key={r.d} style={{ textAlign: "center" }}>
            <div
              title={`${r.d} — ${r.cnt} activity`}
              style={{
                height: 22,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: r.active ? "#10b981" : "#f3f4f6"
              }}
            />
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              {formatDayLabel(r.d)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDayLabel(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
}