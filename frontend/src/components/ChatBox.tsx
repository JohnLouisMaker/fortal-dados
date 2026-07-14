import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatBotProps {
  onBairroDetected: (bairro: string) => void;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  message: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function ChatBot({ onBairroDetected }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      type: "bot",
      message:
        "Olá! Pergunte sobre trânsito, paradas ou qualquer bairro de Fortaleza.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSendMessage(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const userText = inputMessage.trim();
    if (!userText || isLoading) return;

    setInputMessage("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "user", message: userText },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, session_id: sessionId }),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data: { response: string; bairro_detectado: string | null } =
        await res.json();

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "bot", message: data.response },
      ]);

      if (data.bairro_detectado) {
        onBairroDetected(data.bairro_detectado);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "bot",
          message:
            "Não consegui falar com o servidor agora. Verifique se o backend está rodando e tente de novo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-1000 flex flex-col items-start gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom left" }}
            className="flex h-115 w-87.5 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-cyan-50/30 to-blue-50/30 px-4 py-3.5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Fortaleza em Dados AI
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-200 font-serif">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-xs leading-relaxed ${
                      msg.type === "user"
                        ? "ml-auto bg-cyan-500 text-white rounded-tr-xs"
                        : "bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-100"
                    }`}
                  >
                    {msg.message}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-xs bg-slate-100/90 px-4 py-2.5 border border-slate-200/40"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 border-t border-slate-100 bg-white/50 p-3.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pergunte sobre um bairro..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-serif text-slate-800 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/10 disabled:opacity-60 "
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-xl bg-linear-to-r bg-cyan-500 p-2 text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100 flex items-center justify-center w-10 h-10"
                aria-label="Enviar mensagem"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-14 w-14 items-center justify-center rounded-full border bg-cyan-500 text-white transition-all duration-150"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Abrir chat"
      >
        <motion.span
          key={isOpen ? "close" : "open"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </motion.span>
      </motion.button>
    </div>
  );
}
