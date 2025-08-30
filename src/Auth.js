import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Send users back to a dedicated callback route (see below)
  const redirectTo = `${window.location.origin}/auth/callback`;

  const signInWithGoogle = async () => {
    setLoading(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // queryParams: { prompt: "select_account" }, // optional
      },
    });
    if (error) {
      console.error(error);
      setMsg(error.message);
      setLoading(false);
    }
    // On success, Google redirects to /auth/callback
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: email.split("@")[0] || "User" },
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;
        setMsg("Check your email to confirm and sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg("Signed in!");
      }
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 12, padding: 16,
      background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.04)"
    }}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>
        {mode === "signup" ? "Create account" : "Welcome back"}
      </h2>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, border: "1px solid #e5e7eb", background: "#fff",
          padding: "10px 12px", borderRadius: 10, cursor: "pointer"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.602,32.91,29.238,36,24,36c-6.627,0-12-5.373-12-12   s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24   s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.246,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.688,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.163,0,9.86-1.977,13.409-5.197l-6.198-5.238C29.142,35.091,26.715,36,24,36c-5.215,0-9.567-3.07-11.283-7.459 l-6.49,5.005C9.565,40.013,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.351,3.91-5.183,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, margin: "10px 0" }}>
        — or —
      </div>

      <form onSubmit={handleEmailAuth}>
        <label style={{ display: "block", marginBottom: 8 }}>
          <span style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Email</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 4 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Password</span>
          <input
            type="password" required={mode === "signin"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 4 }}
          />
        </label>

        <button
          type="submit" disabled={loading}
          style={{ width: "100%", background: "#111827", color: "#fff", border: 0, padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <div style={{ marginTop: 10, fontSize: 12 }}>
        {mode === "signup" ? (
          <>Already have an account?{" "}
            <button onClick={() => setMode("signin")} style={{ border: 0, background: "transparent", color: "#4f46e5", cursor: "pointer" }}>
              Sign in
            </button>
          </>
        ) : (
          <>New here?{" "}
            <button onClick={() => setMode("signup")} style={{ border: 0, background: "transparent", color: "#4f46e5", cursor: "pointer" }}>
              Create account
            </button>
          </>
        )}
      </div>

      {msg && (
        <div style={{ marginTop: 10, background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "8px 10px", borderRadius: 8, fontSize: 12 }}>
          {msg}
        </div>
      )}
    </div>
  );
}