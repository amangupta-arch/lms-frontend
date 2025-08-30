import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function PickupBundle() {
  const [bundle, setBundle] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("user_bundle_views")
        .select("bundle_id, last_viewed_at, bundles:bundle_id (bundle_id, title, description, image_url)")
        .eq("user_id", user.id)
        .order("last_viewed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (error) console.error(error);
      setBundle(data?.bundles || null);
    })();
    return () => { mounted = false; };
  }, []);

  if (!bundle) return null;

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h5 style={{ margin: 0 }}>Pick Up Where You Left Off</h5>
        <Link to={`/bundle/${bundle.bundle_id}`} style={{ textDecoration: "none", color: "#4f46e5", fontWeight: 600 }}>
          Resume
        </Link>
      </div>

      <Link to={`/bundle/${bundle.bundle_id}`} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, textDecoration: "none", color: "inherit", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", background: bundle.image_url ? "#000" : "#f3f4f6" }}>
          {bundle.image_url ? (
            <img src={bundle.image_url} alt={bundle.title} loading="lazy"
                 style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : null}
        </div>
        <div style={{ padding: 12 }}>
          <h4 style={{ margin: 0 }}>{bundle.title}</h4>
          {bundle.description && <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Get certified after completing this course</p>}
        </div>
      </Link>
    </section>
  );
}
