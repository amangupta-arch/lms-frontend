import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AllBundles() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bundles")
        .select("bundle_id, title, description, image_url, bundle_courses(count)")
        .eq("reco_index", 1)
        .order("created_at", { ascending: true });
      if (!mounted) return;
      if (error) console.error(error);
      setBundles(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>All Bundles</h2>
        <Link to="/home" style={{ textDecoration: "none" }}>← Back</Link>
      </div>

      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}>
        {bundles.map((b) => {
          const count = Array.isArray(b.bundle_courses) && b.bundle_courses[0]?.count ? b.bundle_courses[0].count : 0;
          return (
            <Link
              key={b.bundle_id}
              to={`/bundle/${b.bundle_id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                width: "100%",
                aspectRatio: "16 / 9",
                background: b.image_url ? "#000" : "linear-gradient(135deg, #e5e7eb, #f3f4f6)",
                overflow: "hidden",
              }}>
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#9ca3af", fontWeight: 600, fontSize: 14
                  }}>
                    No image
                  </div>
                )}
              </div>

              <div style={{ padding: 12, display: "grid", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>{b.title}</h3>
                {b.description && (
                  <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.4 }}>
                    {b.description}
                  </div>
                )}
                <div style={{ color: "#6b7280", fontSize: 12 }}>{count} courses</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
