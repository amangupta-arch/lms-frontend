// src/components/Stories.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Stories component:
 * - Fetches rows from `stories` table: { story_id, title, category, thumb_url, content_html, media_url }
 * - Renders horizontal icons; click opens fullscreen modal that cycles stories.
 *
 * NOTE: change column names if your DB uses different ones.
 */

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Expecting a stories table with category field (Career, Parenting, Job, Wealth, Style)
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (!mounted) return;
      if (error) {
        console.error("Stories fetch error:", error);
        setStories([]);
      } else {
        setStories(data || []);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!stories.length) {
    // render placeholders for categories (5 icons)
    const cats = ["Career","Parenting","Job","Wealth","Style"];
    return (
      <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {cats.map((c,i) => (
          <StoryIcon key={c} title={c} onClick={() => {}} />
        ))}
      </div>
    );
  }

  // group by category for top-level icons (unique categories)
  const categories = Array.from(new Map(stories.map(s => [s.category, s])).values());

  return (
    <>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {categories.map((s, idx) => (
          <StoryIcon key={s.category} title={s.category} thumb={s.thumb_url} onClick={() => {
            // open the first story of that category
            const idxAll = stories.findIndex(x => x.category === s.category);
            if (idxAll >= 0) setOpenIndex(idxAll);
          }} />
        ))}
      </div>

      {openIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

function StoryIcon({ title, thumb, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#fff"
    }}>
      <div style={{
        width: 68,
        height: 68,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: thumb ? "#111" : "#0b1220"
      }}>
        {thumb ? <img src={thumb} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ padding:10, textAlign: "center" }}>{title?.slice(0,1)}</div>}
      </div>
      <div style={{ marginTop: 6, fontSize: 12 }}>{title}</div>
    </button>
  );
}

/** Full-screen story viewer */
function StoryViewer({ stories, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    setIdx(startIndex);
  }, [startIndex]);

  if (!stories?.length) return null;
  const s = stories[idx];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      color: "#fff",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
        <div>{s?.category} · {s?.title}</div>
        <div>
          <button onClick={onClose} style={viewerBtnStyle}>Close ✕</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {s.media_url ? (
          <img src={s.media_url} alt={s.title} style={{ maxHeight: "80vh", maxWidth: "96vw", objectFit: "contain" }} />
        ) : (
          <div style={{ maxWidth: "96vw", maxHeight: "80vh", overflow: "auto" }}
               dangerouslySetInnerHTML={{ __html: s.content_html || "<p>No content</p>" }} />
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
        <div>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} style={viewerBtnStyle}>Prev</button>
        </div>
        <div>
          <button onClick={() => setIdx(i => Math.min(stories.length - 1, i + 1))} style={viewerBtnStyle}>Next</button>
        </div>
      </div>
    </div>
  );
}

const viewerBtnStyle = {
  background: "#111827",
  color: "#fff",
  border: "1px solid #374151",
  padding: "8px 10px",
  borderRadius: 8,
};
