import React, { useState } from 'react';
import { Bot, LoaderCircle, Send, Sparkles, X } from 'lucide-react';

const QUICK_PROMPTS = ['How do I search with thermal?', 'Explain human detection triage', 'How can I reconnect the drone?'];
const LOCAL_FALLBACK = 'Aero could not reach the answer service. I can still help with thermal search, detections, SOS, drone links, recon, and payload safety.';

const AeroOrb = ({ isOpen }) => (
  <div className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 ${isOpen ? 'shadow-[0_0_25px_rgba(34,211,238,0.65)]' : 'shadow-[0_0_18px_rgba(16,185,129,0.5)]'}`}>
    <span className="absolute inset-[-4px] rounded-full border border-cyan-300/70 animate-[spin_5s_linear_infinite]" />
    <span className="absolute inset-[-8px] rounded-full border border-pink-400/40 border-l-transparent border-b-transparent animate-[spin_3s_linear_infinite_reverse]" />
    <span className="absolute h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-300 to-fuchsia-400 blur-[3px]" />
    <Bot className="relative z-10 h-5 w-5 text-white" />
  </div>
);

const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const askAero = async (value = query) => {
    const content = value.trim();
    if (!content || isLoading) return;
    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setQuery('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: 'assistant', content: response.ok ? data.answer : LOCAL_FALLBACK }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: LOCAL_FALLBACK }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <aside className="fixed bottom-4 right-4 z-40 flex w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-cyan-300/60 bg-white shadow-2xl shadow-slate-900/25">
          <div className="relative overflow-hidden bg-slate-950 px-4 py-4 text-white">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="relative flex items-center justify-between"><div className="flex items-center gap-3"><AeroOrb isOpen /><div><div className="font-chakra text-lg font-bold tracking-wider">AERO</div><div className="font-mono-code text-[9px] tracking-wider text-cyan-200">MISSION ASSISTANT</div></div></div><button onClick={() => setIsOpen(false)} title="Close Aero" className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div>
          </div>
          <div className="max-h-[min(520px,62vh)] space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.length === 0 && <><div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-fuchsia-50 px-3 py-3 text-xs leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Ask Aero anything.</span> Aero gives direct answers and helps with SAR operations. It cannot see live camera feeds unless you provide the details.</div><div className="space-y-1.5">{QUICK_PROMPTS.map((prompt) => <button key={prompt} onClick={() => askAero(prompt)} className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:border-cyan-400 hover:text-cyan-800"><Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />{prompt}</button>)}</div></>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-7 rounded-xl bg-slate-900 px-3 py-2.5 text-xs leading-relaxed text-white' : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-700'}>{message.role === 'assistant' && <div className="mb-1 flex items-center gap-1 font-mono-code text-[9px] font-bold tracking-wider text-cyan-700"><Sparkles className="h-3 w-3" /> AERO</div>}{message.content}</div>)}
            {isLoading && <div className="flex items-center gap-2 px-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin text-cyan-600" /> Aero is thinking...</div>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); askAero(); }} className="flex gap-2 border-t border-slate-200 bg-white p-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask Aero anything..." aria-label="Ask Aero anything" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /><button type="submit" title="Send question to Aero" disabled={isLoading} className="rounded-xl bg-slate-950 px-3 text-white hover:bg-cyan-900 disabled:opacity-50"><Send className="h-4 w-4" /></button></form>
        </aside>
      )}
      <button onClick={() => setIsOpen((open) => !open)} title="Open Aero mission assistant" className="fixed bottom-4 right-4 z-30 flex items-center gap-3 rounded-full border border-cyan-300/70 bg-slate-950 py-2 pl-2 pr-4 text-white shadow-xl shadow-slate-900/25 transition-transform hover:-translate-y-0.5"><AeroOrb isOpen={isOpen} /><span className="font-chakra text-sm font-bold tracking-wider">AERO</span></button>
    </>
  );
};

export default AICopilot;
