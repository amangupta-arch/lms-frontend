import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Just touching the session is enough; App listens to auth state
      await supabase.auth.getSession();
      if (!mounted) return;
      navigate("/home", { replace: true });
    })();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Signing you in…</h2>
      <p>Please wait.</p>
    </div>
  );
}