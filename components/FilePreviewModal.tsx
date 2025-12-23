import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Image as ImageIcon, Music, Video as VideoIcon, FileCode, Layout, AlertCircle } from 'lucide-react';
import { FileSystemItem, ItemType } from '../types';

interface FilePreviewModalProps {
  item: FileSystemItem;
  onClose: () => void;
  onSave: (id: string, content: string) => void;
  isDark: boolean;
  t: any;
}

// Mock content URLs for valid previews when real content is missing/placeholder
const MOCK_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const MOCK_AUDIO_URL = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav";
const MOCK_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ item, onClose, onSave, isDark, t }) => {
  const [content, setContent] = useState(item.content || '');

  useEffect(() => {
    setContent(item.content || '');
  }, [item]);

  const handleSave = () => {
    onSave(item.id, content);
    onClose();
  };

  const bgClass = isDark ? "bg-gray-800 border-white/10" : "bg-white border-gray-200";
  const headerClass = isDark ? "bg-gray-900/50 border-white/10" : "bg-gray-50 border-gray-200";
  const bodyClass = isDark ? "bg-gray-900/30" : "bg-gray-50/50";
  const textClass = isDark ? "text-white" : "text-gray-900";

  // Helper to determine if content is a valid URL or Data URI
  const isUrlOrData = (str: string) => {
    return str.startsWith('http') || str.startsWith('data:') || str.startsWith('blob:');
  };

  // Helper to get extension
  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';

  const renderContent = () => {
    if (item.type === ItemType.NOTE) {
      return (
        <textarea
          className={`w-full h-full p-8 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm leading-relaxed ${isDark ? 'bg-gray-900/50 text-gray-200' : 'bg-white border border-gray-200 text-gray-800'}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note here..."
          autoFocus
        />
      );
    }

    const ext = getExt(item.name);
    const mime = item.mimeType || '';

    // --- VIDEO ---
    if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
      const src = isUrlOrData(content) ? content : MOCK_VIDEO_URL;
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black rounded-lg overflow-hidden relative group">
             <video src={src} controls autoPlay className="max-w-full max-h-full" />
             {!isUrlOrData(content) && <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded">Sample Video</div>}
        </div>
      );
    }

    // --- AUDIO ---
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'flac'].includes(ext)) {
      const src = isUrlOrData(content) ? content : MOCK_AUDIO_URL;
      return (
        <div className={`flex flex-col items-center justify-center h-full rounded-2xl w-full max-w-2xl mx-auto p-12 border transition-all ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/5' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'}`}>
            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-12 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="w-40 h-40 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                     <Music size={64} className="text-white drop-shadow-lg" />
                </div>
            </div>
            <div className="w-full space-y-2">
                <h3 className={`text-center font-medium ${textClass} mb-4`}>{item.name}</h3>
                <audio src={src} controls className="w-full focus:outline-none" />
            </div>
             {!isUrlOrData(content) && <div className="mt-4 text-[10px] opacity-50">Playing sample audio</div>}
        </div>
      );
    }

    // --- IMAGE ---
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'tiff'].includes(ext)) {
      // Use Picsum for mock images based on item ID to get a consistent random image
      const src = isUrlOrData(content) ? content : `https://picsum.photos/seed/${item.id}/1200/800`;
      return (
        <div className="flex items-center justify-center h-full w-full overflow-hidden">
             <img src={src} alt={item.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      );
    }

    // --- PDF ---
    if (mime === 'application/pdf' || ext === 'pdf') {
        const src = isUrlOrData(content) ? content : MOCK_PDF_URL;
        return (
            <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                <iframe src={src} className="w-full h-full border-0" title={item.name} />
            </div>
        );
    }

    // --- HTML / WEB ---
    if (['html', 'htm'].includes(ext)) {
         return (
            <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner border border-gray-200">
                <iframe 
                    srcDoc={isUrlOrData(content) ? undefined : `
                        <html>
                        <body style="font-family: sans-serif; padding: 2rem; color: #333;">
                            <h1>${item.name}</h1>
                            <p>This is a preview of the HTML file.</p>
                            <hr/>
                            <p>${content}</p>
                            <div style="margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
                                <strong>Interactive Element:</strong><br/>
                                <button style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; margin-top: 10px; cursor: pointer;">Click Me</button>
                            </div>
                        </body>
                        </html>
                    `}
                    src={isUrlOrData(content) ? content : undefined}
                    className="w-full h-full border-0" 
                    title={item.name} 
                    sandbox="allow-scripts"
                />
            </div>
         );
    }

    // --- DOCUMENTS (DOCX, ODT, RTF, ETC) - Simulated View ---
    if (['doc', 'docx', 'odt', 'rtf', 'txt', 'md'].includes(ext)) {
        return (
            <div className={`w-full h-full overflow-y-auto p-8 lg:p-16 ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#f8f9fa]'}`}>
                <div className={`max-w-[850px] mx-auto min-h-[1000px] shadow-lg p-12 ${isDark ? 'bg-[#252526] text-gray-300' : 'bg-white text-gray-900'}`}>
                    {/* Simulated Header */}
                    <div className="mb-8 border-b pb-4 opacity-50 flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest">{item.name}</span>
                        <span className="text-xs">Page 1 of 3</span>
                    </div>
                    
                    {/* Simulated Content Skeleton if no real content */}
                    {(!content || content.startsWith('This is a sample')) ? (
                        <div className="space-y-4 animate-in fade-in duration-500">
                             <h1 className="text-3xl font-bold mb-6">{item.name.replace(/\.[^/.]+$/, "")}</h1>
                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-11/12"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-3/4"></div>
                             
                             <div className="h-32 bg-current opacity-5 rounded w-full my-8 flex items-center justify-center">
                                 <ImageIcon className="opacity-20" size={48} />
                             </div>

                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-5/6"></div>

                             <h2 className="text-xl font-bold mt-8 mb-4">Section Analysis</h2>
                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                             <p className="opacity-70 mt-4 leading-relaxed">{content}</p>
                        </div>
                    ) : (
                         <pre className="whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
                    )}
                </div>
            </div>
        );
    }

    // --- CODE / DATA (JSON, XML, CSV, JS, TS) ---
    if (['json', 'xml', 'csv', 'tsv', 'js', 'ts', 'tsx', 'css', 'sql'].includes(ext)) {
         return (
            <div className={`w-full h-full overflow-auto rounded-lg border flex flex-col ${isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className={`px-4 py-2 text-xs font-mono border-b ${isDark ? 'bg-[#252526] text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {mime || 'text/plain'}
                </div>
                <div className="p-6">
                    <pre className={`text-xs font-mono leading-relaxed ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        {content || (
                            // Mock content for code if empty
                            ext === 'json' ? '{\n  "mock": "data",\n  "status": "active"\n}' : 
                            ext === 'csv' ? 'id,name,value\n1,Test,100\n2,Mock,200' : 
                            '// No content available'
                        )}
                    </pre>
                </div>
            </div>
         );
    }

    // --- FALLBACK ---
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle size={48} className="mb-4 opacity-50 text-yellow-500"/>
        <p className="text-lg font-medium">{t.previewNotSupported}</p>
        <p className="text-sm opacity-70 mt-2">{item.name}</p>
      </div>
    );
  };

  const getIcon = () => {
      const ext = getExt(item.name);
      if (['mp4', 'mov', 'avi'].includes(ext)) return <VideoIcon size={20} className="text-blue-400" />;
      if (['mp3', 'wav'].includes(ext)) return <Music size={20} className="text-purple-400" />;
      if (['html', 'xml', 'json', 'js'].includes(ext)) return <FileCode size={20} className="text-green-400" />;
      if (['doc', 'docx', 'pdf', 'txt'].includes(ext)) return <FileText size={20} className="text-orange-400" />;
      return <ImageIcon size={20} className="text-blue-400" />;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 ${bgClass}`}>
        {/* Header */}
        <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 ${headerClass}`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex flex-col">
                <span className={`font-semibold tracking-wide text-sm ${textClass}`}>{item.name}</span>
                <span className={`text-[10px] opacity-50 ${textClass}`}>{item.size || 'Unknown Size'} • {item.mimeType || 'Unknown Type'}</span>
            </div>
            {item.type === ItemType.NOTE && <span className={`text-[10px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded ml-2 ${isDark ? 'bg-gray-900 border-white/10 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>{t.editable}</span>}
          </div>
          <div className="flex items-center gap-2">
            {item.type === ItemType.NOTE && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-blue-500/20 mr-2"
              >
                <Save size={14} /> {t.save}
              </button>
            )}
            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/10 text-gray-500 hover:text-black'}`}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`flex-1 overflow-hidden relative ${bodyClass}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;