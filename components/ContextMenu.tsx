import React, { useEffect, useRef, useState } from 'react';
import { FolderPlus, Briefcase, StickyNote, Edit2, UploadCloud, Grid, Type, Calendar, LayoutGrid, Sun, Moon, Languages, ChevronRight, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCreateFolder: () => void;
  onCreateSmartFolder: () => void;
  onCreateNote: () => void;
  onRename: () => void;
  onDelete: () => void;
  onUpload: () => void;
  onSort: (method: 'name' | 'date' | 'tidy') => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  canCreateSmartFolder: boolean;
  hasSelection: boolean;
  isDark: boolean;
  t: any;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, y, onClose, onCreateFolder, onCreateSmartFolder, onCreateNote, onRename, onDelete, onUpload, onSort, onToggleTheme, onToggleLang, canCreateSmartFolder, hasSelection, isDark, t
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const bgClass = isDark ? "bg-gray-900/95 border-white/10 text-gray-200" : "bg-white/95 border-gray-200 text-gray-800";
  const hoverClass = isDark ? "hover:bg-white/10" : "hover:bg-black/5";
  const dividerClass = isDark ? 'bg-white/10' : 'bg-black/10';

  return (
    <div 
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()} // Stop propagation to prevent canvas drag/box-select from firing
      className={`fixed z-50 w-64 backdrop-blur-xl border rounded-lg shadow-2xl py-1 text-sm overflow-visible animate-in fade-in zoom-in duration-100 ${bgClass}`}
      style={{ top: y, left: x }}
    >
      {/* Group 1: Creation */}
      <button onClick={onCreateFolder} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
        <FolderPlus size={16} /> {t.newFolder}
      </button>
      
      {canCreateSmartFolder && (
        <button onClick={onCreateSmartFolder} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
          <Briefcase size={16} /> {t.newSmartCase}
        </button>
      )}

      <button onClick={onCreateNote} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
        <StickyNote size={16} /> {t.newNote}
      </button>

      <div className={`h-px my-1 mx-2 ${dividerClass}`} />

      {/* Group 2: Upload */}
      <button onClick={onUpload} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
        <UploadCloud size={16} /> {t.addFiles}
      </button>

      <div className={`h-px my-1 mx-2 ${dividerClass}`} />

      {/* Group 3: View / Sort */}
      <div 
        className="relative" 
        onMouseEnter={() => setShowSortMenu(true)} 
        onMouseLeave={() => setShowSortMenu(false)}
      >
        <button className={`w-full text-left px-4 py-2 flex items-center justify-between gap-3 transition-colors ${hoverClass}`}>
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} /> {t.autoArrange}
          </div>
          <ChevronRight size={14} className="opacity-50" />
        </button>

        {/* Submenu */}
        {showSortMenu && (
          <div className={`absolute left-full top-0 ml-1 w-48 border rounded-lg shadow-xl py-1 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-100 ${bgClass}`}>
             <button onClick={() => { onSort('name'); onClose(); }} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
               <Type size={14} /> {t.byName}
             </button>
             <button onClick={() => { onSort('date'); onClose(); }} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
               <Calendar size={14} /> {t.byDate}
             </button>
             <button onClick={() => { onSort('tidy'); onClose(); }} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
               <Grid size={14} /> {t.tidyUp}
             </button>
          </div>
        )}
      </div>

      <div className={`h-px my-1 mx-2 ${dividerClass}`} />

      {/* Group 4: Settings */}
      <button onClick={onToggleLang} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
        <Languages size={16} /> {t.changeLang}
      </button>
      <button onClick={onToggleTheme} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />} {t.toggleTheme}
      </button>

      {/* Group 5: Selection Actions */}
      {hasSelection && (
        <>
          <div className={`h-px my-1 mx-2 ${dividerClass}`} />
          <button onClick={onRename} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${hoverClass}`}>
            <Edit2 size={16} /> {t.rename}
          </button>
          <button onClick={onDelete} className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors hover:bg-red-500/20 text-red-500`}>
            <Trash2 size={16} /> {t.delete}
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;