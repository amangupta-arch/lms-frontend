import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Streak7 from "../components/Streak7";
import StreakCalendar30 from "../components/StreakCalendar30";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error) console.error(error);
      setEmail(data?.user?.email || "");
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const help = () => {
    window.location.href = "mailto:support@yourdomain.com?subject=LMS%20Help";
  };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>Your Profile</h1>

      {/* Card: user */}
      <section style={cardStyle}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Email</div>
          <div style={{ fontWeight: 600 }}>{email}</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={help} style={btnLight}>Help</button>
          <button onClick={logout} style={{ ...btnDark, marginLeft: "auto" }}>Log out</button>
        </div>
      </section>

      {/* Card: last 7 days strip */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Last 7 days</h2>
        <Streak7 />
      </section>

      {/* Card: 30-day calendar */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Last 30 days</h2>
        <StreakCalendar30 />
      </section>
    </main>
  );
}

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
};

const btnLight = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const btnDark = {
  background: "#111827",
  color: "#fff",
  border: 0,
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};