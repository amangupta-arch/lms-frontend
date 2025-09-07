// src/components/BundlesGridReco0.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function BundlesGridReco0() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setBundles([]); setLoading(false); return; }

      // get bundle ids user has access to (enrollments table)
      const { data: enrolls, error: eErr } = await supabase
        .from("enrollments")
        .select("bundle_id")
        .eq("user_id", user.id)
        .not("bundle_id", "is", null);

      if (eErr) { console.error(eErr); setBundles([]); setLoading(false); return; }
      const ids = (enrolls || []).map(r => r.bundle_id).filter(Boolean);
      if (!ids.length) { setBundles([]); setLoading(false); return; }

      // fetch bundles where reco_index = 0
      const { data, error } = await supabase
        .from("bundles")
        .select("bundle_id, title, description, image_url, reco_index")
        .in("bundle_id", ids)
        .eq("reco_index", 0)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      if (!mounted) return;
      setBundles(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 12 }}>Loading bundles…</div>;
  if (!bundles.length) return <div style={{ padding: 12, color: "#9ca3af" }}>No bundles.</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {bundles.map(b => (
        <Link key={b.bundle_id} to={`/bundle/${b.bundle_id}`} style={{
          display: "flex",
          gap: 12,
          textDecoration: "none",
          color: "inherit",
          background: "#05060a",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #111827"
        }}>
          <div style={{ width: 84, height: 84, borderRadius: 8, overflow: "hidden", background: "#0b1220" }}>
            {b.image_url ? <img src={b.image_url} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800 }}>{b.title}</div>
            <div style={{ color: "#9ca3af", marginTop: 6 }}>{b.description}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
