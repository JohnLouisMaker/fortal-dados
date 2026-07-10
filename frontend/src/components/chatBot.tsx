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
        body: JSON.stringify({ message: userText }),
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
    <div className="fixed bottom-4 right-4 z-1000 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="flex h-96 w-80 flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-amber-100 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Fortaleza em Dados AI
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.type === "user"
                        ? "ml-auto bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-800"
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
                  className="flex w-fit items-center gap-1 rounded-xl bg-slate-100 px-3 py-2"
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
              className="flex gap-2 border-t border-amber-100 p-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pergunte sobre um bairro..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 p-3 text-white shadow-lg hover:from-amber-600 hover:to-orange-600"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Abrir chat"
      >
        <motion.span
          key={isOpen ? "close" : "open"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </motion.span>
      </motion.button>
    </div>
  );
}
