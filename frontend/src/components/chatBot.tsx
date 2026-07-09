import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface ChatBotProps {
  onBairroDetected: (bairro: string) => void;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  message: string;
}

export default function ChatBot({ onBairroDetected }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      type: "bot",
      message: "Olá! Como posso ajudar?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  async function handleSendMessage(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      message: userText,
    };

    setMessages((prev) => [...prev, newUserMessage]);

    setTimeout(() => {
      const newBotMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: "bot",
        message: "Aguarde, estou processando sua mensagem...",
      };

      setMessages((prev) => [...prev, newBotMessage]);
    }, 1540);
  }

  return (
    <div className="fixed bottom-4 right-4 z-1000 flex flex-col items-end gap-3">
      {/* CHAT ABERTO */}
      {isOpen && (
        <div className="bg-white p-4 rounded-xl shadow-2xl w-80 h-96 flex flex-col border border-gray-100">
          <div className="flex justify-between items-center mb-2 pb-2 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Fortaleza em Dados AI
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto text-gray-600">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded-md ${
                  msg.type === "user"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.message}
              </div>
            ))}
          </div>

          {/* O Form básico do input entra aqui para ativar a função */}
          <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pergunte sobre um bairro..."
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
