import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";

import { LocaleProvider } from "./locale/LocaleProvider";
import Header from "./components/Header";
import LanguageBar from "./components/LanguageBar";
import FooterNav from "./components/FooterNav";

import Landing from "./pages/Landing";
import Auth from "./Auth";
import Home from "./pages/Home";
import Challenges from "./pages/Challenges";
import UseAI from "./pages/UseAI";
import CourseDetail from "./pages/CourseDetail";
import LessonPage from "./pages/LessonPage";
import AllCourses from "./pages/AllCourses";
import AllBundles from "./pages/AllBundles";
import BasicBundles from "./pages/BasicBundles";
import BundleDetail from "./pages/BundleDetail";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";

import "./index.css";
import "./pages/landing.css"

// ---- Guards ----
function RequireAuth({ session }) {
  const location = useLocation();
  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?mode=signup&reason=auth_required&redirect=${redirect}`} replace />;
  }
  return <Outlet />;
}

function PublicHome({ session }) {
  return session ? <Home /> : <Landing />;
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <LocaleProvider>
      <BrowserRouter>
        <ChromeFrame>
          <Routes>
            {/* Root: Landing if logged out, Home if logged in */}
            <Route path="/" element={<PublicHome session={session} />} />

            {/* Public-only auth routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Everything below requires auth */}
            <Route element={<RequireAuth session={session} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/courses" element={<AllCourses />} />
              <Route path="/bundles" element={<AllBundles />} />
              <Route path="/bundlesbasic" element={<BasicBundles />} />
              <Route path="/bundle/:bundleId" element={<BundleDetail />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/ai" element={<UseAI />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
            </Route>

            {/* Fallback: always go to root (Landing/Home) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChromeFrame>
      </BrowserRouter>
    </LocaleProvider>
  );
}

/**
 * ChromeFrame shows Header + LanguageBar + FooterNav,
 * but hides them on lesson pages.
 */
function ChromeFrame({ children }) {
  const location = useLocation();
  const hideChrome =
    location.pathname.startsWith("/course/") &&
    location.pathname.includes("/lesson/");

  return (
    <>
      {!hideChrome && <Header />}
      {!hideChrome && <LanguageBar />}
      {children}
      {!hideChrome && <FooterNav />}
    </>
  );
}