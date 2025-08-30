import { useEffect, useRef, useState } from "react";

export default function HeroSlideshow({ images = [] }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  // auto-advance every 5s (optional)
  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const childW = el.firstChild?.clientWidth || 0;
    el.scrollTo({ left: childW * idx, behavior: "smooth" });
  }, [idx]);

  if (!images.length) return null;

  return (
    <section style={{ marginTop: 12 }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 6,
        }}
      >
        {images.map((src, i) => (
          <div key={i}
               style={{
                 flex: "0 0 100%",
                 maxWidth: "100%",
                 scrollSnapAlign: "start",
                 paddingRight: 12,              // creates the “peek”
               }}
          >
            <div style={{
              width: "100%",
              aspectRatio: "16 / 5",
              borderRadius: 12,
              overflow: "hidden",
              background: src ? "#000" : "#f3f4f6",
            }}>
              {src && (
                <img src={src} alt={`Slide ${i+1}`} loading="lazy"
                     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
