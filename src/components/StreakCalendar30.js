import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StreakCalendar30() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_my_activity_window", { p_days: 30 });
      if (!mounted) return;
      if (error) console.error(error);
      setRows(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const maxCnt = useMemo(() => {
    return rows.reduce((m, r) => Math.max(m, r.cnt || 0), 0);
  }, [rows]);

  if (loading) return <div style={{ padding: 8 }}>Loading calendar…</div>;

  // Arrange as 5 rows × 7 cols (oldest at top-left, newest at bottom-right)
  const cells = rows; // already 30 items, oldest→newest
  const weeks = [];
  for (let i = 0; i < 30; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div style={{ display: "grid", gap: 6 }}>
        {weeks.map((week, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {week.map((r) => (
              <div
                key={r.d}
                title={`${r.d} — ${r.cnt} activity`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: colorForCount(r.cnt, maxCnt),
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* tiny legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "#6b7280", fontSize: 12 }}>
        <span>Less</span>
        {[0, 1, 2, 3].map((n) => (
          <div key={n} style={{ width: 14, height: 14, borderRadius: 4, border: "1px solid #e5e7eb", background: colorForCount(n, Math.max(maxCnt, 3)) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function colorForCount(cnt, maxCnt) {
  if (!cnt || cnt <= 0) return "#f3f4f6";            // 0
  if (cnt === 1) return "#bbf7d0";                    // light green
  if (cnt === 2) return "#86efac";                    // mid
  if (cnt >= 3) return "#10b981";                     // strong
  // fallback
  return maxCnt >= 3 ? "#10b981" : "#86efac";
}
