import { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:3001"; // backend base URL

export default function UseAI() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const listRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    setErrorText("");

    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const payload = await safeParse(res);
        const detail =
          payload?.detail || payload?.error || `HTTP ${res.status}`;
        setErrorText(String(detail));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry — something went wrong." },
        ]);
        return;
      }

      const data = await res.json();
      const reply = data?.reply ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      if (err?.name === "AbortError") {
        setErrorText("Request cancelled.");
      } else {
        setErrorText(err?.message || "Network error");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I hit an error reaching the server." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function cancelRequest() {
    abortRef.current?.abort();
  }

  function onKeyDown(e) {
    // Enter to send, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <div style={styles.title}>UseAI · ChatGPT</div>
            <div style={styles.subtitle}>Secure server-side API proxy</div>
          </div>
          {loading ? (
            <button onClick={cancelRequest} style={styles.stopBtn}>
              Stop
            </button>
          ) : null}
        </header>

        <div ref={listRef} style={styles.messages}>
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && <TypingIndicator />}
        </div>

        {errorText ? (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {errorText}
          </div>
        ) : null}

        <form onSubmit={sendMessage} style={styles.inputRow}>
          <textarea
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            rows={2}
          />
          <button type="submit" style={styles.sendBtn} disabled={loading}>
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        ...styles.bubble,
        alignSelf: isUser ? "flex-end" : "flex-start",
        background: isUser ? "#1463ff" : "#f1f3f5",
        color: isUser ? "#fff" : "#111",
      }}
    >
      {!isUser && <span style={styles.badge}>AI</span>}
      <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={styles.typingWrap} className="typingWrap">
      <div style={styles.dot} />
      <div style={styles.dot} />
      <div style={styles.dot} />
    </div>
  );
}

async function safeParse(res) {
  try {
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* ---------- inline styles (simple, no CSS deps) ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0b0f17",
    padding: 16,
  },
  card: {
    width: "min(920px, 100%)",
    background: "#fff",
    borderRadius: 16,
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #eef1f4",
  },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  stopBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 16,
    height: 520,
    overflowY: "auto",
    background:
      "linear-gradient(180deg,#f8fafc 0%, rgba(248,250,252,0.7) 100%)",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    padding: "10px 12px",
    lineHeight: 1.5,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -10,
    left: 10,
    background: "#111",
    color: "#fff",
    borderRadius: 6,
    fontSize: 10,
    padding: "2px 6px",
  },
  inputRow: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderTop: "1px solid #eef1f4",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    resize: "vertical",
    outline: "none",
  },
  sendBtn: {
    background: "#1463ff",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    minWidth: 90,
    fontWeight: 600,
  },
  errorBox: {
    background: "#fff4f4",
    color: "#991b1b",
    borderTop: "1px solid #fde0e0",
    borderBottom: "1px solid #fde0e0",
    padding: "8px 12px",
    fontSize: 13,
  },
  typingWrap: {
    display: "inline-flex",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 999,
    background: "#f1f3f5",
    width: 56,
    alignSelf: "flex-start",
    marginLeft: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#9aa2af",
    animation: "pulse 1.2s infinite ease-in-out",
  },
};

// Simple keyframes injected once (for typing dots)
if (typeof document !== "undefined" && !document.getElementById("ua-keyframes")) {
  const style = document.createElement("style");
  style.id = "ua-keyframes";
  style.innerHTML = `
  @keyframes pulse {
    0%, 80%, 100% { transform: scale(0.8); opacity: .6; }
    40% { transform: scale(1); opacity: 1; }
  }
  .typingWrap div:nth-child(1) { animation-delay: 0s; }
  .typingWrap div:nth-child(2) { animation-delay: .15s; }
  .typingWrap div:nth-child(3) { animation-delay: .3s; }
  `;
  document.head.appendChild(style);
}
