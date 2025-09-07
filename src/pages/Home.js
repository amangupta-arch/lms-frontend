// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import Streak7 from "../components/Streak7";
import Stories from "../components/Stories";
import BundleResumeCarousel from "../components/BundleResumeCarousel";
import BundlesGridReco0 from "../components/BundlesGridReco0";
import HeroSlideshow from "../components/HeroSlideshow";
import CoursesCarousel from "../components/CoursesCarousel";
import { supabase } from "../supabaseClient";
import { useI18n } from "../locale/LocaleProvider";

export default function Home() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null); // { bundle_id, percent, minutesLeft } optional

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user || null);

      // Example: compute "minutes left to complete current course" placeholder
      // If you have an RPC that returns remaining time, call it here.
      // I put a simple placeholder calculation: minutes left = lessons left * avg duration (if you have it).
      // TODO: Replace with exact RPC if present.
      // setResumeInfo({ minutesLeft: 45 });
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <main style={styles.page}>
      {/* row 1 */}
      <section style={styles.row}>
        <div style={styles.streakCol}>
          <Streak7 />
        </div>

        <div style={styles.ctaCol}>
          <div style={styles.ctaCard}>
            <div style={{ fontSize: 14, color: "#d1d5db", marginBottom: 6 }}>
              {t("home.completeCourseHeader") || "Complete your course in"}
            </div>
            {/* TODO: compute minutesLeft as real value */}
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              00:00 {/* replace with computed XX:YY */}
            </div>
            <div style={{ marginTop: 8, color: "#9ca3af", fontSize: 13 }}>
              {t("home.completeCourseSub") || "to unlock your full potential"}
            </div>
          </div>
        </div>
      </section>

      {/* row 2: Stories */}
      <section style={{ marginTop: 14 }}>
        <Stories />
      </section>

      {/* optional: hero slideshow */}
      <section style={{ marginTop: 16 }}>
        <HeroSlideshow images={[
          "https://jbabtowqlbqvksenhgqt.supabase.co/storage/v1/object/public/course-images/quiz%20(1).jpg",
          "https://jbabtowqlbqvksenhgqt.supabase.co/storage/v1/object/public/course-images/quiz.jpg"
        ]} />
      </section>

      {/* row 3: Resume / Start bundle carousel (single "top" bundle shown) */}
      <section style={{ marginTop: 18 }}>
        <BundleResumeCarousel />
      </section>

      {/* row 4: Bundles user has access to and reco_index = 0 */}
      <section style={{ marginTop: 18 }}>
        <BundlesGridReco0 />
      </section>

      {/* For larger screen, optionally show CoursesCarousel */}
      <section style={{ marginTop: 18 }}>
        <CoursesCarousel />
      </section>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: 16,
    background: "#000",
    color: "#fff",
    display: "grid",
    gap: 12,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    alignItems: "start",
  },
  streakCol: {
    // left - Streak component should size itself
  },
  ctaCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaCard: {
    width: "100%",
    background: "#0b1220",
    border: "1px solid #1f2937",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
  },
};