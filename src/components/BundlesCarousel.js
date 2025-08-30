import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CoursesCarousel.css"; // re-use same CSS

export default function BundlesCarouselReco() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bundles")
        .select(`
          bundle_id, title, description, image_url,
          bundle_courses(count)
        `)
        .eq("reco_index", 0)
        .order("created_at", { ascending: true })
        .limit(3);

      if (!mounted) return;
      if (error) console.error(error);
      setBundles(data || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="cc-loading">Loading…</div>;
  if (!bundles.length) return <div className="cc-empty">No bundles yet.</div>;

  return (
    <section className="cc" style={{ marginTop: 28 }}>
      <div className="cc-header">
        <h4 className="cc-title">Learn AI Tools</h4>
        <Link to="/bundlesbasic" className="cc-cta">
          <span className="cc-cta-text">See All</span>
        </Link>
      </div>

      <div ref={trackRef} className="cc-track">
        {bundles.map((b) => {
          const count =
            Array.isArray(b.bundle_courses) && b.bundle_courses[0]?.count
              ? b.bundle_courses[0].count
              : 0;

          return (
            <Link
              key={b.bundle_id}
              to={`/bundle/${b.bundle_id}`}
              className="cc-card"
            >
              <BundleImage src={b.image_url} alt={b.title} />

              <div className="cc-card-body">
                <h3 className="cc-card-title">{b.title}</h3>

                {b.description && (
                  <div className="cc-desc">{b.description}</div>
                )}

                <div className="cc-lessons">{count} courses</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BundleImage({ src, alt }) {
  const has = !!src;
  return (
    <div className={`cc-img ${has ? "cc-img--has" : "cc-img--placeholder"}`}>
      {has ? (
        <img
          src={src}
          alt={alt || "Bundle image"}
          loading="lazy"
          className="cc-img-el"
        />
      ) : (
        <div className="cc-img-ph">No image</div>
      )}
    </div>
  );
}
