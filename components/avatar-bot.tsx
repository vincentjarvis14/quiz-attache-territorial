"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, ChevronDown, Scale } from "lucide-react";

type Message = {
  role: "user" | "bot";
  content: string;
  sources?: string[];
};

type AvatarBotProps = {
  questionContext?: string;
  placeholder?: string;
};

// Parse la réponse de l'API RAG : "Article L151-1\n{contenu}\n\n———\n\nArticle L151-2\n..."
function BotMessage({ content }: { content: string }) {
  if (!content) {
    return (
      <span className="italic text-ink/40 text-[13px]">Lex réfléchit…</span>
    );
  }

  const sections = content.split(/\n\n———\n\n/);

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const trimmed = section.trim();
        const firstNewline = trimmed.indexOf("\n");
        const headerLine =
          firstNewline !== -1 ? trimmed.slice(0, firstNewline) : trimmed;
        const body =
          firstNewline !== -1 ? trimmed.slice(firstNewline + 1).trim() : "";

        const isArticle = /^Article\s+[LRDAa]/i.test(headerLine);

        return (
          <div
            key={i}
            className={
              i > 0 ? "border-t border-ink/[0.07] pt-4" : undefined
            }
          >
            {isArticle && (
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-4 w-[3px] shrink-0 rounded-full bg-coral-400"
                  aria-hidden
                />
                <span className="font-display text-[13px] font-bold text-ink">
                  {headerLine}
                </span>
              </div>
            )}
            {body && (
              <p className="text-[13px] leading-relaxed text-ink/80">
                {body}
              </p>
            )}
            {!isArticle && !body && (
              <p className="text-[13px] leading-relaxed text-ink/80">
                {trimmed}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AvatarBot({
  questionContext,
  placeholder = "Posez une question sur le Code de l'urbanisme…",
}: AvatarBotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask() {
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    const botMsg: Message = { role: "bot", content: "", sources: [] };
    setMessages((prev) => [...prev, botMsg]);

    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, questionContext }),
      });

      if (!res.body) throw new Error("Pas de stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value);
        const lines = raw.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const payload = JSON.parse(line.slice(6));

          if (payload.type === "sources") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                sources: payload.sources,
              };
              return updated;
            });
          } else if (payload.type === "delta") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + payload.text,
              };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Une erreur est survenue. Veuillez réessayer.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-[360px] max-h-[540px] flex-col overflow-hidden rounded-2xl border border-ink/[0.08] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-coral-500 px-4 py-3 text-white">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Scale className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-none font-display">Lex</p>
              <p className="mt-0.5 text-xs text-white/75">
                Assistant Code de l&apos;urbanisme
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 transition-colors hover:text-white"
              aria-label="Réduire"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50">
                  <Scale className="h-5 w-5 text-coral-500" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-ink/60">
                  Posez une question sur le droit de l&apos;urbanisme
                </p>
                <p className="text-[12px] text-ink/35">
                  Lex consulte le Code de l&apos;urbanisme et les textes de référence
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-coral-500 text-white"
                      : "rounded-bl-sm border border-ink/[0.07] bg-cream text-ink"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <>
                      <BotMessage content={msg.content} />
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1 border-t border-ink/[0.07] pt-2.5">
                          {msg.sources.map((s) => (
                            <span
                              key={s}
                              className="rounded px-1.5 py-0.5 font-mono text-[11px] bg-coral-50 text-coral-700 ring-1 ring-inset ring-coral-200"
                            >
                              Art. {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="leading-relaxed">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-ink/[0.07] bg-cream px-3.5 py-3">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-coral-400 animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-ink/[0.07] px-3 pb-3 pt-2">
            <div className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 ring-1 ring-ink/[0.08] focus-within:ring-coral-400 transition-shadow">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                placeholder={placeholder}
                disabled={loading}
                className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink/35"
              />
              <button
                onClick={ask}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-coral-500 text-white transition-colors hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-lg transition-all hover:bg-coral-600 hover:scale-105 active:scale-95"
        title="Lex — Assistant Code de l'urbanisme"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <Scale className="h-6 w-6" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
