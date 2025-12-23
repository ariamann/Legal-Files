import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, RefreshCw, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { CaseData, ChatMessage, FileSystemItem } from '../types';
import { generateCaseScenario, chatWithCase } from '../services/geminiService';

// Typewriter Effect Component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
        if (index >= text.length) clearInterval(interval);
    }, 15); 
    return () => clearInterval(interval);
  }, [text]);
  
  return <span>{displayedText}</span>;
}

interface CasePanelProps {
  caseData: CaseData;
  caseFolder: FileSystemItem;
  files: FileSystemItem[];
  onUpdateCaseData: (id: string, data: Partial<CaseData>) => void;
  onClose: () => void;
  isDark: boolean;
  t: any;
}

const CasePanel: React.FC<CasePanelProps> = ({ caseData, caseFolder, files, onUpdateCaseData, onClose, isDark, t }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenario' | 'chat'>('chat'); // Default to chat as per "turns into a field" feeling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [caseData.chatHistory, activeTab, isGenerating]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newHistory = [...caseData.chatHistory, userMsg];
    onUpdateCaseData(caseData.id, { chatHistory: newHistory });
    setInput('');
    setIsGenerating(true);

    const responseText = await chatWithCase(
      newHistory.map(h => ({ role: h.role, text: h.text })), 
      input, 
      caseFolder.name
    );

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    onUpdateCaseData(caseData.id, { chatHistory: [...newHistory, aiMsg] });
    setIsGenerating(false);
  };

  const regenerateScenario = async () => {
    setIsGenerating(true);
    const result = await generateCaseScenario(caseFolder.name, files);
    onUpdateCaseData(caseData.id, { 
      scenario: result.scenario,
      confidenceScore: result.confidence 
    });
    setIsGenerating(false);
  };

  const lastMsgId = caseData.chatHistory.length > 0 ? caseData.chatHistory[caseData.chatHistory.length - 1].id : null;

  const bgClass = isDark ? "bg-gray-900/95 border-white/10" : "bg-white/95 border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const subTextClass = isDark ? "text-gray-400" : "text-gray-500";
  const inputBgClass = isDark ? "bg-gray-800 text-white border-white/10" : "bg-gray-100 text-gray-900 border-gray-300";

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`absolute right-0 top-0 bottom-0 w-full md:w-96 backdrop-blur-2xl border-l shadow-2xl z-40 flex flex-col ${bgClass}`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-gray-200'}`}>
        <div className="flex items-center gap-2">
            <Sparkles className="text-purple-500 animate-pulse" size={18} />
            <h2 className={`font-semibold ${textClass}`}>{t.caseIntel}</h2>
        </div>
        <button onClick={onClose} className={`${subTextClass} hover:${textClass}`}>✕</button>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-500/10' : `${subTextClass} hover:${textClass}`}`}
        >
          {t.assistant}
        </button>
        <button 
          onClick={() => setActiveTab('scenario')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'scenario' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/10' : `${subTextClass} hover:${textClass}`}`}
        >
          {t.scenario}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'scenario' ? (
            <motion.div 
              key="scenario"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {/* Confidence Meter */}
              <div className="space-y-2">
                <div className={`flex justify-between text-xs uppercase tracking-wider ${subTextClass}`}>
                  <span>{t.confidence}</span>
                  <span>{caseData.confidenceScore}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${caseData.confidenceScore}%` }}
                    className={`h-full ${caseData.confidenceScore > 70 ? 'bg-green-500' : caseData.confidenceScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              {/* Scenario Text */}
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <FileCheck size={16} /> {t.narrative}
                  </h3>
                  <button 
                    onClick={regenerateScenario} 
                    disabled={isGenerating}
                    className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/10 text-gray-500 hover:text-black'}`}
                  >
                    <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                  </button>
                </div>
                <textarea 
                  value={caseData.scenario}
                  onChange={(e) => onUpdateCaseData(caseData.id, { scenario: e.target.value })}
                  className={`w-full h-64 bg-transparent text-sm leading-relaxed focus:outline-none resize-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                />
              </div>

              {/* Logic Gaps */}
              {caseData.confidenceScore < 80 && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                   <h4 className="text-red-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                     <AlertCircle size={14} /> {t.logicGaps}
                   </h4>
                   <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                     The timeline has inconsistencies regarding the dates of the supplied invoices vs the contract start date. Please upload the "Addendum A" document.
                   </p>
                 </div>
              )}

            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {caseData.chatHistory.length === 0 && (
                  <div className={`text-center mt-10 ${subTextClass}`}>
                    <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t.askMe}</p>
                  </div>
                )}
                {caseData.chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : isDark ? 'bg-gray-800 text-gray-200 border border-white/10' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>
                      {msg.role === 'model' && msg.id === lastMsgId ? (
                          <TypewriterText text={msg.text} />
                      ) : (
                          msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                   <div className="flex justify-start">
                     <div className={`rounded-2xl px-4 py-2 flex gap-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                     </div>
                   </div>
                )}
              </div>
              
              <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.typeMessage}
                    className={`w-full rounded-full pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none border ${inputBgClass}`}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isGenerating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CasePanel;