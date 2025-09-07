import Streak7 from "../components/Streak7";
import PickupBundle from "../components/PickupBundle";
import HeroSlideshow from "../components/HeroSlideshow";
import BundlesCarousel from "../components/BundlesCarousel";
import BundlesCarouselReco from "../components/BundlesCarouselReco";
import CoursesCarousel from "../components/CoursesCarousel";

// If you still want CoursesCarousel, import and place it where you like.

export default function Home() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16, display: "grid", gap: 18}}>

      
      {/* 1) 7 Day Streak */}
      <Streak7 />

      {/* 2) Pick Up Where You Left Off */}
      <PickupBundle />

      {/* 3) Slideshow (2 images; show “peek” on mobile by default) */}
      <HeroSlideshow images={[
        "https://jbabtowqlbqvksenhgqt.supabase.co/storage/v1/object/public/course-images/quiz%20(1).jpg",  // replace with your URLs
        "https://jbabtowqlbqvksenhgqt.supabase.co/storage/v1/object/public/course-images/quiz.jpg"
      ]} />
      {/* 3.5) Course Carousel (all/most recent) */}
      <CoursesCarousel />

      {/* 4) Bundle Carousel (all/most recent) */}
      <BundlesCarousel />

      {/* 5) Bundle Carousel (reco_index = 1) */}
      <BundlesCarouselReco />
    </main>
  );
}