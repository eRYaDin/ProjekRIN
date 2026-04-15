import { useState, useRef, useEffect, useCallback } from "react";

// ── Character Definitions ────────────────────────────────────────────────────
const CHARACTERS = {
  normal: {
    label: "RIN",
    tag: "calm",
    color: "#8ab4ff",
    responses: [
      "Aku di sini. Ada yang ingin kamu ceritakan?",
      "Paham. Lanjutkan.",
      "Aku mendengarkan.",
      "Tercatat. Ada lagi?",
      "Oke. Aku proses.",
      "Hmm. Menarik. Cerita lebih.",
      "Aku ada, selalu.",
    ],
    onCommand: (cmd) => `[sistem] Perintah '${cmd}' dijalankan.`,
    onImage: () => "Gambar diterima. Aku lihat.",
    onUnknown: (cmd) => `Perintah '${cmd}' tidak dikenali. Ketik /help untuk bantuan.`,
  },
  galak: {
    label: "RIN (Galak)",
    tag: "aggressive",
    color: "#ff6b6b",
    responses: [
      "Apa? Langsung ke intinya.",
      "Hmm. Kenapa harus aku yang peduli?",
      "Oke, oke. Tapi jangan lebay.",
      "Udah? Segitu aja?",
      "Jangan buang waktuku.",
      "Kalau mau ngobrol, serius dong.",
      "Ngerti. Tapi bikin lebih jelas lain kali.",
    ],
    onCommand: (cmd) => `[sistem] Iya iya, '${cmd}' dijalankan. Puas?`,
    onImage: () => "Gambar. Oke. Terus?",
    onUnknown: (cmd) => `'${cmd}'? Gak ada. Coba lagi.`,
  },
  santai: {
    label: "RIN (Santai)",
    tag: "casual",
    color: "#69db7c",
    responses: [
      "Hehe, oke oke~ ada apa nih?",
      "Wah seru! Lanjutin dong~",
      "Hmm... iya juga sih hahaha",
      "Santai aja, aku dengerin kok~",
      "Asyik! Cerita lebih~",
      "Ohh gitu~ menarik juga tuh",
      "Yooo~ ada yang bisa aku bantu?",
    ],
    onCommand: (cmd) => `[sistem] Siap! '${cmd}' sudah aku jalanin~ ✓`,
    onImage: () => "Ooh gambar! Keren~",
    onUnknown: (cmd) => `Eh '${cmd}' tuh apa ya? Coba /help dulu hehe~`,
  },
};

const HELP_TEXT = `Perintah yang tersedia:
  /char normal    → ganti ke mode calm
  /char galak     → ganti ke mode aggressive  
  /char santai    → ganti ke mode casual
  /clear          → hapus semua chat
  /help           → tampilkan ini`;

// ── Typing Effect Hook ───────────────────────────────────────────────────────
function useTypingEffect(text, speed = 22) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ── Message Components ───────────────────────────────────────────────────────
function SystemMessage({ text }) {
  return (
    <div style={{
      padding: "6px 0",
      color: "#555",
      fontSize: "11px",
      fontStyle: "italic",
      letterSpacing: "0.05em",
    }}>
      {text}
    </div>
  );
}

function RinMessage({ text, charColor, charLabel, animate }) {
  const { displayed } = useTypingEffect(animate ? text : "", 18);
  const shown = animate ? displayed : text;

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "18px" }}>
      <div style={{
        minWidth: "32px",
        height: "32px",
        borderRadius: "50%",
        border: `1px solid ${charColor}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        color: charColor,
        letterSpacing: "0.05em",
        flexShrink: 0,
        marginTop: "2px",
        background: `${charColor}11`,
      }}>
        AI
      </div>
      <div>
        <div style={{ fontSize: "10px", color: charColor, marginBottom: "4px", letterSpacing: "0.1em", opacity: 0.8 }}>
          {charLabel}
        </div>
        <div style={{
          color: "#d4d4d4",
          fontSize: "13.5px",
          lineHeight: "1.65",
          maxWidth: "520px",
          whiteSpace: "pre-wrap",
        }}>
          {shown}
          {animate && shown !== text && (
            <span style={{ animation: "blink 0.8s step-end infinite", color: charColor }}>█</span>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text, image }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
      <div style={{ maxWidth: "520px" }}>
        {image && (
          <div style={{ marginBottom: "6px", borderRadius: "6px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
            <img src={image} alt="uploaded" style={{ maxWidth: "280px", maxHeight: "200px", display: "block", objectFit: "cover" }} />
          </div>
        )}
        {text && (
          <div style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "6px 0px 6px 6px",
            padding: "10px 14px",
            color: "#ffffff",
            fontSize: "13.5px",
            lineHeight: "1.65",
            textAlign: "right",
          }}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator({ charColor }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px" }}>
      <div style={{
        minWidth: "32px", height: "32px", borderRadius: "50%",
        border: `1px solid ${charColor}44`, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "10px", color: charColor,
        background: `${charColor}11`,
        flexShrink: 0,
      }}>AI</div>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: charColor,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            opacity: 0.6,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
let msgIdCounter = 0;
const genId = () => ++msgIdCounter;

export default function RinConsole() {
  const [messages, setMessages] = useState([
    {
      id: genId(), type: "rin", animate: false,
      text: "Sistem online. Aku RIN — private console kamu.\nKetik apa saja, atau /help untuk melihat perintah.",
      char: "normal",
    }
  ]);
  const [input, setInput] = useState("");
  const [char, setChar] = useState("normal");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const addMsg = (msg) => setMessages(prev => [...prev, { id: genId(), ...msg }]);

  const handleCommand = useCallback((raw) => {
    const parts = raw.trim().slice(1).split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();
    const charDef = CHARACTERS[char];

    if (cmd === "clear") {
      setMessages([]);
      return;
    }
    if (cmd === "help") {
      addMsg({ type: "system", text: HELP_TEXT });
      return;
    }
    if (cmd === "char") {
      if (arg && CHARACTERS[arg]) {
        setChar(arg);
        addMsg({ type: "system", text: `[sistem] Karakter diganti ke: ${CHARACTERS[arg].label}` });
      } else {
        addMsg({ type: "system", text: `[sistem] Karakter tidak valid. Pilih: normal | galak | santai` });
      }
      return;
    }
    if (cmd === "mode") {
      addMsg({ type: "system", text: charDef.onCommand(raw.slice(1)) });
      return;
    }
    addMsg({ type: "system", text: charDef.onUnknown(cmd) });
  }, [char]);

  const handleSend = useCallback(async (text, image = null) => {
    if (!text.trim() && !image) return;

    // Add user message
    addMsg({ type: "user", text: text.trim(), image });

    if (text.trim().startsWith("/")) {
      handleCommand(text.trim());
      return;
    }

    // RIN response
    setThinking(true);
    const delay = 600 + Math.random() * 500;
    await new Promise(r => setTimeout(r, delay));
    setThinking(false);

    const charDef = CHARACTERS[char];
    let response;
    if (image && !text.trim()) {
      response = charDef.onImage();
    } else {
      response = charDef.responses[Math.floor(Math.random() * charDef.responses.length)];
    }

    addMsg({ type: "rin", text: response, char, animate: true });
  }, [char, handleCommand]);

  const handleSubmit = () => {
    const val = input.trim();
    if (!val) return;
    setInput("");
    handleSend(val);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleSend(input.trim(), ev.target.result);
      setInput("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const charDef = CHARACTERS[char];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.4);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        textarea::placeholder { color: #333; }
        textarea { resize: none; outline: none; border: none; background: transparent; }
      `}</style>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "#0a0a0a",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#eaeaea",
        maxWidth: "760px",
        margin: "0 auto",
        position: "relative",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 24px",
          borderBottom: "1px solid #161616",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: charDef.color,
              boxShadow: `0 0 8px ${charDef.color}`,
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#444", fontWeight: 300 }}>
              RIN v0.1
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "9px", letterSpacing: "0.15em",
              color: charDef.color, opacity: 0.7,
              background: `${charDef.color}11`,
              border: `1px solid ${charDef.color}33`,
              padding: "2px 8px", borderRadius: "2px",
            }}>
              {charDef.tag.toUpperCase()}
            </span>
            <span style={{ fontSize: "9px", color: "#2a2a2a", letterSpacing: "0.1em" }}>
              PRIVATE
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 24px 8px",
          background: "#111",
          display: "flex",
          flexDirection: "column",
        }}>
          {messages.map((msg) => {
            if (msg.type === "system") return (
              <div key={msg.id} style={{ animation: "fadeIn 0.3s ease" }}>
                <SystemMessage text={msg.text} />
              </div>
            );
            if (msg.type === "user") return (
              <div key={msg.id} style={{ animation: "fadeIn 0.25s ease" }}>
                <UserMessage text={msg.text} image={msg.image} />
              </div>
            );
            if (msg.type === "rin") return (
              <div key={msg.id} style={{ animation: "fadeIn 0.3s ease" }}>
                <RinMessage
                  text={msg.text}
                  charColor={CHARACTERS[msg.char]?.color || charDef.color}
                  charLabel={CHARACTERS[msg.char]?.label || charDef.label}
                  animate={msg.animate}
                />
              </div>
            );
            return null;
          })}
          {thinking && <ThinkingIndicator charColor={charDef.color} />}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: "1px solid #161616",
          background: "#0a0a0a",
          padding: "14px 24px 16px",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            background: "#111",
            border: `1px solid #1e1e1e`,
            borderRadius: "4px",
            padding: "10px 14px",
            transition: "border-color 0.2s",
          }}
            onFocus={() => {}}
          >
            <span style={{ color: "#333", fontSize: "13px", flexShrink: 0, paddingBottom: "1px" }}>›</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ketik sesuatu..."
              rows={1}
              style={{
                flex: 1,
                color: "#eaeaea",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: "1.5",
                maxHeight: "120px",
                overflowY: "auto",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                title="Upload gambar"
                style={{
                  background: "none", border: "1px solid #1e1e1e",
                  borderRadius: "3px", cursor: "pointer",
                  padding: "4px 8px", color: "#333",
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#666"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#1e1e1e"; e.target.style.color = "#333"; }}
              >
                IMG
              </button>
              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && !thinking}
                style={{
                  background: input.trim() ? `${charDef.color}22` : "none",
                  border: `1px solid ${input.trim() ? charDef.color + "55" : "#1e1e1e"}`,
                  borderRadius: "3px", cursor: input.trim() ? "pointer" : "default",
                  padding: "4px 10px", color: input.trim() ? charDef.color : "#2a2a2a",
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.15s",
                }}
              >
                SEND
              </button>
            </div>
          </div>

          <div style={{
            marginTop: "8px",
            display: "flex", gap: "6px", alignItems: "center",
          }}>
            <span style={{ fontSize: "9px", color: "#222", letterSpacing: "0.1em" }}>CHAR:</span>
            {["normal", "galak", "santai"].map(c => (
              <button
                key={c}
                onClick={() => { setChar(c); addMsg({ type: "system", text: `[sistem] Karakter: ${CHARACTERS[c].label}` }); }}
                style={{
                  background: char === c ? `${CHARACTERS[c].color}15` : "none",
                  border: `1px solid ${char === c ? CHARACTERS[c].color + "55" : "#1e1e1e"}`,
                  borderRadius: "2px", cursor: "pointer",
                  padding: "2px 8px", fontSize: "9px",
                  color: char === c ? CHARACTERS[c].color : "#2a2a2a",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em",
                  transition: "all 0.15s",
                }}
              >
                {c.toUpperCase()}
              </button>
            ))}
            <span style={{ fontSize: "9px", color: "#1a1a1a", marginLeft: "auto", letterSpacing: "0.08em" }}>
              /help • ENTER to send
            </span>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </>
  );
}
