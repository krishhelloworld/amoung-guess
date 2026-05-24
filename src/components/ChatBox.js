import React, { useState,useRef,useEffect } from "react";

const THEMES = {
  blue: {
    border: "border-blue-500",
    headerText: "text-blue-300",
    panelBg: "bg-blue-900/20",
    bubbleMe: "bg-blue-600",
    bubbleOther: "bg-blue-800",
    sendBtn: "bg-blue-600 hover:bg-blue-700",
    inputBg: "bg-blue-950/40",
  },
  orange: {
    border: "border-orange-500",
    headerText: "text-orange-300",
    panelBg: "bg-orange-900/20",
   
    sendBtn: "bg-orange-600 hover:bg-orange-700",
    inputBg: "bg-orange-950/40",
  },
};

export default function ChatBox({ team = "blue", title = "Team Chat", senders ,disabled}) {
  const t = THEMES[team] ?? THEMES.blue;//nullish coalescing operator (??) if the team is orange then the first one will work
  const [messages, setMessages] = useState([
    { text: (`Welcome to chat! ${team}`), sender: "Game" },
  ]);
  const [input, setInput] = useState("");

const messagesEndRef = useRef(null);

const sendMessage = () => {
   
    if ( input.trim()==="") { setInput(""); return;}
   setMessages([...messages, { text: input, sender: senders }]);
    setInput("");
  };
   // Auto scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`w-[300px] h-[480px]  rounded-xl border ${t.border} ${t.panelBg} backdrop-blur p-3 flex flex-col`}
    >
      <div className={`font-semibold mb-2 ${t.headerText}`}>{title}</div>

    <div className="relative flex-1 overflow-hidden">
  <div className="absolute inset-0 overflow-y-auto pr-4 -mr-9">
    <div className="space-y-1">   {messages.map((m, i) => {
          // const mine = m.sender === "You";
          return (
            <div
              key={i}
              className="max-w-[85%] px-3 py-2 rounded-lg text-sm "
            >
             <span className="font-bold">{m.sender}: </span>
              {m.text}
            </div>
          );
        })}
       {/* dummy div for auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className={disabled ? "hidden":"mt-2 flex gap-2"} >
        <input
          className={`flex-1 px-3 py-2 rounded-lg outline-none text-white placeholder-white/60 ${t.inputBg}`}
          placeholder="Type message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
      
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className={`px-3 py-2 rounded-lg text-white ${t.sendBtn}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}

/*


import React, { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "You" }]);
    setInput("");
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-64 h-64 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <p key={i} className="text-sm">
            <span className="font-bold">{m.sender}: </span>
            {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type..."
          className="flex-1 px-2 py-1 rounded bg-gray-200 text-black"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-3 py-1 rounded text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;*/