import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Settings, Folder, StickyNote, UploadCloud, Moon, Sun, Languages, MessageSquare, X } from 'lucide-react';
import { FileSystemItem, ItemType, AnalysisStatus, Position, CaseData } from '../types';
import { getIconForFileType, MOCK_INITIAL_SCENARIO, TRANSLATIONS, SUPPORTED_EXTENSIONS, NOTE_COLORS, getRandomNoteColor } from '../constants';
import ContextMenu from './ContextMenu';
import CasePanel from './CasePanel';
import FilePreviewModal from './FilePreviewModal';
import { analyzeFileContent } from '../services/geminiService';

// --- Types for Props ---

interface FileIconProps {
    item: FileSystemItem;
    isSelected: boolean;
    isDropTarget: boolean;
    isRenaming: boolean;
    isDark: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
    onDragStart: (e: React.MouseEvent, id: string) => void;
    onRenameSubmit: (id: string, newName: string) => void;
    onRenameStart: (id: string) => void;
}

const FileIconComponent: React.FC<FileIconProps> = ({ 
    item, 
    isSelected, 
    isDropTarget,
    isRenaming,
    isDark,
    onSelect, 
    onClick,
    onDoubleClick, 
    onDragStart,
    onRenameSubmit,
    onRenameStart
}) => {
    const Icon = getIconForFileType(item.name, item.type);
    const [renameValue, setRenameValue] = useState(item.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            setRenameValue(item.name);
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming, item.name]);
    
    // Status Indicator
    let statusColor = "bg-transparent";
    if (item.type === ItemType.FILE) {
        if (item.analysisStatus === AnalysisStatus.ANALYZING) statusColor = "bg-yellow-400";
        if (item.analysisStatus === AnalysisStatus.COMPLETED) statusColor = "bg-green-400";
        if (item.analysisStatus === AnalysisStatus.FAILED) statusColor = "bg-red-400";
    }

    const handleRenameSubmit = () => {
        if (renameValue.trim()) {
            onRenameSubmit(item.id, renameValue);
        }
    };

    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const selectedBg = isDark ? 'bg-blue-500/30 ring-blue-400/50' : 'bg-blue-500/20 ring-blue-400/50';
    const selectedText = 'bg-blue-600 text-white';

    // Determine Icon Color
    let iconClass = '';
    if (item.type === ItemType.NOTE) {
        const colorKey = (item.color as keyof typeof NOTE_COLORS) || 'yellow';
        iconClass = NOTE_COLORS[colorKey]?.icon || 'text-yellow-500';
    } else if (item.type === ItemType.SMART_FOLDER) {
        iconClass = 'text-purple-500';
    } else if (item.type === ItemType.FOLDER) {
        iconClass = 'text-blue-500';
    } else {
        iconClass = isDark ? 'text-gray-300' : 'text-gray-600';
    }

    // Standard Icon Rendering
    return (
        <div 
            id={`file-icon-${item.id}`} // Added ID for hit testing
            className={`absolute flex flex-col items-center w-28 group cursor-pointer transition-all duration-300 ease-out ${isSelected ? 'scale-105 z-20' : 'z-0'}`}
            style={{ left: item.position.x, top: item.position.y, touchAction: 'none' }}
            onMouseDown={(e) => { 
                if (!isRenaming) { 
                    e.stopPropagation(); 
                    onSelect(e); 
                    if (e.button === 0) { // Only drag on left click
                        onDragStart(e, item.id); 
                    }
                } 
            }}
            onClick={(e) => {
                if (!isRenaming) {
                    e.stopPropagation();
                    onClick(e);
                }
            }}
            onDoubleClick={(e) => { if (!isRenaming) { e.stopPropagation(); onDoubleClick(); } }}
        >
            <div className={`relative p-3 rounded-xl transition-all duration-200 
                ${isSelected ? `${selectedBg} ring-2 backdrop-blur-sm` : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}
                ${isDropTarget ? 'scale-110 ring-4 ring-blue-500/70 bg-blue-500/20 z-10' : ''}
            `}>
                <Icon 
                    size={48} 
                    className={`${iconClass} drop-shadow-md filter`} 
                    strokeWidth={1.5}
                />
                
                {/* Status Badge */}
                {item.type === ItemType.FILE && (
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-full flex items-center justify-center border`}>
                       {item.analysisStatus === AnalysisStatus.ANALYZING ? (
                           <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                           <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
                       )}
                   </div>
                )}
                 {item.type === ItemType.SMART_FOLDER && (
                   <div className="absolute -top-1 -right-1">
                       <span className="flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                       </span>
                   </div>
                )}
            </div>
            
            {isRenaming ? (
                <input 
                    ref={inputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-2 text-xs font-medium text-center w-full px-1 rounded border focus:outline-none ${isDark ? 'bg-black text-white border-blue-500' : 'bg-white text-black border-blue-500'}`}
                />
            ) : (
                <span 
                    className={`mt-2 text-xs font-medium text-center truncate w-full px-2 rounded ${isSelected ? selectedText : textColor} ${!isSelected && (isDark ? 'shadow-black' : 'shadow-white')}`}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        onRenameStart(item.id);
                    }}
                >
                    {item.name}
                </span>
            )}
            
            {/* Progress Bar for analysis */}
            {item.analysisStatus === AnalysisStatus.ANALYZING && (
                <div className="mt-1 w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 animate-pulse w-2/3"></div>
                </div>
            )}
        </div>
    );
};

// --- Animations ---

const folderVariants = {
  enter: (direction: number) => ({
    scale: direction > 0 ? 0.8 : 1.2,
    opacity: 0,
    filter: 'blur(10px)',
  }),
  center: {
    zIndex: 1,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    zIndex: 0,
    scale: direction > 0 ? 1.2 : 0.8,
    opacity: 0,
    filter: 'blur(10px)',
  })
};

// --- Main Component ---

const FileSystem = () => {
    // --- State ---
    const [items, setItems] = useState<FileSystemItem[]>([]);
    const [currentPath, setCurrentPath] = useState<string | null>(null); // null = Desktop
    const [selection, setSelection] = useState<string[]>([]);
    const [clipboard, setClipboard] = useState<{items: FileSystemItem[], action: 'copy'} | null>(null);
    
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);
    // Stores offsets for ALL selected items during a drag
    const [dragOffsets, setDragOffsets] = useState<Record<string, Position>>({});
    const hasMovedRef = useRef(false);

    // Box Selection State
    const [isBoxSelecting, setIsBoxSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{start: Position, current: Position} | null>(null);

    const [cases, setCases] = useState<Record<string, CaseData>>({});
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null); // Controls panel visibility
    const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [direction, setDirection] = useState(0); 
    const [renamingId, setRenamingId] = useState<string | null>(null);
    
    // Config State
    const [isDark, setIsDark] = useState(true);
    const [lang, setLang] = useState<'EN' | 'CN'>('EN');
    
    const t = TRANSLATIONS[lang];
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef(items); 

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    // --- Helpers ---
    const currentFolderItems = items.filter(item => item.parentId === currentPath);
    
    const isSmartFolder = (folderId: string | null) => {
        if (!folderId) return false;
        const folder = items.find(i => i.id === folderId);
        return folder?.type === ItemType.SMART_FOLDER;
    };

    // Determine if we are *inside* a smart folder hierarchy
    const getSmartContextId = (path: string | null): string | null => {
        let curr = path;
        while (curr) {
            const folder = items.find(i => i.id === curr);
            if (folder?.type === ItemType.SMART_FOLDER) return folder.id;
            curr = folder?.parentId || null;
        }
        return null;
    };

    const smartContextId = getSmartContextId(currentPath);

    // --- Init ---
    useEffect(() => {
        const examplesFolderId = 'examples-folder';
        const initialItems: FileSystemItem[] = [
             { id: '1', parentId: null, name: 'Project Alpha Case', type: ItemType.SMART_FOLDER, position: { x: 50, y: 50 }, createdAt: Date.now(), analysisStatus: AnalysisStatus.COMPLETED, analysisProgress: 100 },
             { id: '2', parentId: null, name: 'Personal Notes', type: ItemType.FOLDER, position: { x: 180, y: 50 }, createdAt: Date.now(), analysisStatus: AnalysisStatus.COMPLETED, analysisProgress: 100 },
             { id: '3', parentId: '2', name: 'Meeting Minutes', type: ItemType.NOTE, position: { x: 50, y: 50 }, createdAt: Date.now(), analysisStatus: AnalysisStatus.COMPLETED, analysisProgress: 100, color: 'yellow', content: "Meeting Minutes - Oct 24\n\nAttendees: John, Jane, Bob\n\nTopics:\n- Case strategy\n- Evidence collection\n- Timeline review\n\nAction items:\n- Bob to review contracts\n- Jane to contact witness" },
             { id: examplesFolderId, parentId: null, name: 'Supported Formats', type: ItemType.FOLDER, position: { x: 310, y: 50 }, createdAt: Date.now(), analysisStatus: AnalysisStatus.COMPLETED, analysisProgress: 100 },
        ];
        
        // Generate Example Files
        const exampleFiles: FileSystemItem[] = SUPPORTED_EXTENSIONS.map((ext, index) => {
            const col = index % 6;
            const row = Math.floor(index / 6);
            return {
                id: `example-${ext}-${index}`,
                parentId: examplesFolderId,
                name: `Sample File.${ext.toLowerCase()}`,
                type: ItemType.FILE,
                position: { x: 50 + col * 120, y: 50 + row * 120 },
                createdAt: Date.now(),
                analysisStatus: AnalysisStatus.COMPLETED,
                analysisProgress: 100,
                content: `This is a sample content for ${ext} file type.`,
                size: '15 KB',
                mimeType: 'application/octet-stream' // Generic type for icon resolution
            };
        });

        const initialCases: Record<string, CaseData> = {
            '1': {
                id: '1',
                scenario: MOCK_INITIAL_SCENARIO,
                confidenceScore: 65,
                pendingQuestions: [],
                chatHistory: []
            }
        };

        setItems([...initialItems, ...exampleFiles]);
        setCases(initialCases);
    }, []);


    // --- Actions (Create, Paste, Copy) ---

    const handleCreateItem = (type: ItemType) => {
        if (!containerRef.current) return;
        
        let initialName = type === ItemType.NOTE ? t.newNote : type === ItemType.SMART_FOLDER ? t.newSmartCase : t.newFolder;
        
        const rect = containerRef.current.getBoundingClientRect();
        let posX = 100;
        let posY = 100;

        if (contextMenu) {
             posX = contextMenu.x - rect.left;
             posY = contextMenu.y - rect.top;
             posX = Math.max(10, Math.min(posX, rect.width - 120));
             posY = Math.max(10, Math.min(posY, rect.height - 120));
        } else {
            // Random scatter for shortcuts
            posX = 50 + Math.random() * 200;
            posY = 50 + Math.random() * 200;
        }

        const newItem: FileSystemItem = {
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            parentId: currentPath,
            name: initialName,
            type: type,
            position: { x: posX, y: posY },
            createdAt: Date.now(),
            analysisStatus: AnalysisStatus.COMPLETED,
            analysisProgress: 100,
            content: type === ItemType.NOTE ? '' : undefined,
            color: type === ItemType.NOTE ? getRandomNoteColor() : undefined
        };

        if (type === ItemType.SMART_FOLDER) {
            setCases(prev => ({
                ...prev,
                [newItem.id]: {
                    id: newItem.id,
                    scenario: t.caseInitialized,
                    confidenceScore: 0,
                    pendingQuestions: [],
                    chatHistory: []
                }
            }));
        }

        setItems(prev => [...prev, newItem]);
        setContextMenu(null);

        // Auto Rename
        setRenamingId(newItem.id);
    };

    const handleCopy = () => {
        if (selection.length === 0) return;
        const selectedItems = itemsRef.current.filter(i => selection.includes(i.id));
        setClipboard({ items: selectedItems, action: 'copy' });
    };

    const handlePaste = () => {
        if (!clipboard || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = 20;
        const offsetY = 20;

        const newItems: FileSystemItem[] = clipboard.items.map((item, index) => {
             // Cascade position for pasted items
             const newPos = {
                 x: Math.min(rect.width - 100, Math.max(20, item.position.x + offsetX + (index * 10))),
                 y: Math.min(rect.height - 100, Math.max(20, item.position.y + offsetY + (index * 10)))
             };

             const newId = Date.now().toString() + index;
             
             // If creating a Smart Folder copy, we need to init its Case Data too
             if (item.type === ItemType.SMART_FOLDER && cases[item.id]) {
                 setCases(prev => ({
                     ...prev,
                     [newId]: { ...cases[item.id], id: newId }
                 }));
             }

             return {
                 ...item,
                 id: newId,
                 parentId: currentPath, // Paste into current view
                 position: newPos,
                 name: item.parentId === currentPath ? `${item.name} Copy` : item.name,
                 createdAt: Date.now()
             };
        });

        setItems(prev => [...prev, ...newItems]);
        setSelection(newItems.map(i => i.id)); // Select newly pasted items
    };

    const handleSelectAll = () => {
        const idsInView = itemsRef.current
            .filter(i => i.parentId === currentPath)
            .map(i => i.id);
        setSelection(idsInView);
    };

    // --- SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMeta = e.metaKey || e.ctrlKey;
            
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (isMeta) {
                switch(e.key.toLowerCase()) {
                    case 'a':
                        e.preventDefault();
                        handleSelectAll();
                        break;
                    case 'n':
                        e.preventDefault();
                        handleCreateItem(ItemType.FOLDER);
                        break;
                    case 'c':
                        e.preventDefault();
                        handleCopy();
                        break;
                    case 'p': // As requested for Paste
                    case 'v': // Standard Paste
                        e.preventDefault();
                        handlePaste();
                        break;
                    case 'k':
                        e.preventDefault();
                        if (!smartContextId) { // Only allow if not already inside a smart case hierarchy
                            handleCreateItem(ItemType.SMART_FOLDER);
                        }
                        break;
                    case 't':
                        e.preventDefault();
                        handleCreateItem(ItemType.NOTE);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPath, selection, clipboard, smartContextId]); // Dependencies for shortcuts


    // --- Mouse/Drag Logic ---

    // Handler for background clicks to start Box Selection
    const handleContainerMouseDown = (e: React.MouseEvent) => {
        // Only trigger if clicking directly on the background or specific container elements
        // (Event propagation from icons is stopped, so this should only fire on empty space)
        if (e.button !== 0) return; // Only left click

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const startPos = { 
            x: e.clientX - rect.left, 
            y: e.clientY - rect.top 
        };

        setIsBoxSelecting(true);
        setSelectionBox({ start: startPos, current: startPos });
        setContextMenu(null);
        setRenamingId(null);

        // Clear selection unless modifier key is held
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            setSelection([]);
        }
    };

    const handleDragStart = (e: React.MouseEvent, id: string) => {
        if (renamingId) return;
        const item = items.find(i => i.id === id);
        if (!item || !containerRef.current) return;
        
        hasMovedRef.current = false; // Reset move tracking

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Determine what is being dragged
        let itemsToDragIds = selection.includes(id) ? selection : [id];
        
        // Update selection if the dragged item wasn't previously selected
        if (!selection.includes(id)) {
            setSelection([id]);
        }

        const newOffsets: Record<string, Position> = {};
        
        itemsToDragIds.forEach(draggedId => {
            const itemObj = items.find(i => i.id === draggedId);
            if (itemObj) {
                newOffsets[draggedId] = {
                    x: mouseX - itemObj.position.x,
                    y: mouseY - itemObj.position.y
                };
            }
        });

        setDragOffsets(newOffsets);
        setDraggingId(id); // Main drag leader
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 1. Handle Item Dragging
        if (draggingId) {
            hasMovedRef.current = true; // Mark as moved
            setItems(prevItems => {
                 const newItems = [...prevItems];
                 
                 Object.keys(dragOffsets).forEach(id => {
                     const offset = dragOffsets[id];
                     const x = mouseX - offset.x;
                     const y = mouseY - offset.y;
                     
                     const newX = Math.max(0, Math.min(x, rect.width - 80));
                     const newY = Math.max(0, Math.min(y, rect.height - 80));

                     const itemIndex = newItems.findIndex(i => i.id === id);
                     if (itemIndex > -1) {
                         newItems[itemIndex] = { ...newItems[itemIndex], position: { x: newX, y: newY } };
                     }
                 });
                 return newItems;
            });

            // Hit testing for folders
            const primaryItem = itemsRef.current.find(i => i.id === draggingId);
            if (primaryItem) {
                 const currentItemsInView = itemsRef.current.filter(i => i.parentId === currentPath);
                 let foundTarget = null;
                 
                 for (const item of currentItemsInView) {
                     if (dragOffsets[item.id]) continue; 
                     if (item.type !== ItemType.FOLDER && item.type !== ItemType.SMART_FOLDER) continue;
         
                     const dx = Math.abs(item.position.x - primaryItem.position.x);
                     const dy = Math.abs(item.position.y - primaryItem.position.y);
                     
                     if (dx < 50 && dy < 50) {
                         foundTarget = item.id;
                         break;
                     }
                 }
                 setDragTargetId(foundTarget);
            }
        } 
        // 2. Handle Box Selection
        else if (isBoxSelecting && selectionBox) {
            setSelectionBox(prev => prev ? { ...prev, current: { x: mouseX, y: mouseY } } : null);

            // Calculate Box Geometry
            const startX = selectionBox.start.x;
            const startY = selectionBox.start.y;
            const curX = mouseX;
            const curY = mouseY;

            const boxLeft = Math.min(startX, curX);
            const boxTop = Math.min(startY, curY);
            const boxRight = Math.max(startX, curX);
            const boxBottom = Math.max(startY, curY);

            // Check intersections
            const currentItemsInView = itemsRef.current.filter(i => i.parentId === currentPath);
            const newSelection: string[] = [];

            // Assumed item dimensions (approximate)
            const ITEM_W = 112; 
            const ITEM_H = 112; 

            currentItemsInView.forEach(item => {
                const itemLeft = item.position.x;
                const itemTop = item.position.y;
                const itemRight = itemLeft + ITEM_W;
                const itemBottom = itemTop + ITEM_H;

                // AABB Intersection check
                const isOverlapping = (
                    boxLeft < itemRight &&
                    boxRight > itemLeft &&
                    boxTop < itemBottom &&
                    boxBottom > itemTop
                );

                if (isOverlapping) {
                    newSelection.push(item.id);
                }
            });

            // If we want to support additive selection with modifiers, we'd merge here.
            // For now, simpler implementation: Box select replaces selection (standard finder behavior unless modifier held at start)
            setSelection(newSelection);
        }

    }, [draggingId, dragOffsets, currentPath, isBoxSelecting, selectionBox]);

    const handleMouseUp = useCallback(() => {
        // Finish Dragging
        if (draggingId && dragTargetId) {
             setItems(prev => prev.map(item => {
                 if (dragOffsets[item.id]) {
                     return { ...item, parentId: dragTargetId, position: { x: 50, y: 50 } };
                 }
                 return item;
             }));
             // IMPORTANT: Do NOT clear selection here to allow multi-select drop persistence
        }

        // Finish Box Selection
        if (isBoxSelecting) {
            setIsBoxSelecting(false);
            setSelectionBox(null);
        }

        setDraggingId(null);
        setDragTargetId(null);
        setDragOffsets({});
    }, [draggingId, dragTargetId, dragOffsets, isBoxSelecting]);

    useEffect(() => {
        if (draggingId || isBoxSelecting) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, isBoxSelecting, handleMouseMove, handleMouseUp]);


    // --- File Processing ---

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            if (file.type.startsWith('text/') || file.type === 'application/json' || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
                reader.onload = (e) => resolve(e.target?.result as string || '');
                reader.readAsText(file);
            } else {
                reader.onload = (e) => resolve(e.target?.result as string || '');
                reader.readAsDataURL(file);
            }
        });
    };

    const processUploadedFiles = async (fileList: File[]) => {
        const newFilesPromises = fileList.map(async (file, index) => {
            const content = await readFileContent(file);
            
            return {
                id: Date.now().toString() + index,
                parentId: currentPath,
                name: file.name,
                type: ItemType.FILE,
                mimeType: file.type,
                size: (file.size / 1024).toFixed(2) + ' KB',
                position: { x: 50 + (index * 20), y: 50 + (index * 20) }, // cascade
                createdAt: Date.now(),
                analysisStatus: AnalysisStatus.PENDING,
                analysisProgress: 0,
                content: content
            } as FileSystemItem;
        });

        const newFiles = await Promise.all(newFilesPromises);

        setItems(prev => [...prev, ...newFiles]);

        newFiles.forEach(file => {
            startAnalysis(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFiles = Array.from(e.target.files) as File[];
            await processUploadedFiles(uploadedFiles);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSort = (method: 'name' | 'date' | 'tidy') => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const PADDING = 50;
        const GRID_W = 120;
        const GRID_H = 120;
        const COLS = Math.max(1, Math.floor((rect.width - PADDING) / GRID_W));

        // Filter items in current folder
        const itemsToArrange = items.filter(i => i.parentId === currentPath);
        const otherItems = items.filter(i => i.parentId !== currentPath);

        let sortedItems = [...itemsToArrange];

        if (method === 'name') {
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        } else if (method === 'date') {
            sortedItems.sort((a, b) => b.createdAt - a.createdAt);
        } else if (method === 'tidy') {
            // Sort by Y roughly, then X
            sortedItems.sort((a, b) => {
                const rowA = Math.round(a.position.y / 20); // Tolerance
                const rowB = Math.round(b.position.y / 20);
                if (rowA === rowB) return a.position.x - b.position.x;
                return a.position.y - b.position.y;
            });
        }

        // Apply Grid Positions
        const reorderedItems = sortedItems.map((item, index) => {
            const col = index % COLS;
            const row = Math.floor(index / COLS);
            return {
                ...item,
                position: {
                    x: PADDING + col * GRID_W,
                    y: PADDING + row * GRID_H
                }
            };
        });

        setItems([...otherItems, ...reorderedItems]);
    };

    const handleDelete = useCallback(() => {
        if (selection.length === 0) return;

        // Find all IDs to delete (including recursive children)
        const idsToDelete = new Set(selection);
        let sizeBefore = 0;
        
        // Iteratively find children until no new children are added
        do {
            sizeBefore = idsToDelete.size;
            itemsRef.current.forEach(item => {
                if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
                    idsToDelete.add(item.id);
                }
            });
        } while (idsToDelete.size > sizeBefore);

        setItems(prev => prev.filter(i => !idsToDelete.has(i.id)));
        setSelection([]);
        setContextMenu(null);
    }, [selection]);

    // Keyboard shortcuts (DELETE)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!renamingId && !previewItem) { // Don't delete if renaming or previewing
                    handleDelete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete, renamingId, previewItem]);

    const startAnalysis = async (file: FileSystemItem) => {
        setItems(prev => prev.map(i => i.id === file.id ? { ...i, analysisStatus: AnalysisStatus.ANALYZING } : i));

        let context = "General";
        if (file.parentId) {
            const parent = items.find(i => i.id === file.parentId);
            if (parent) {
                context = parent.name;
                let curr: FileSystemItem | undefined = parent;
                while (curr) {
                    if (curr.type === ItemType.SMART_FOLDER) {
                        context = `Case: ${curr.name}, Category: ${context}`;
                        break;
                    }
                    curr = items.find(i => i.id === curr?.parentId);
                }
            }
        }

        await new Promise(r => setTimeout(r, 1500));
        const summary = await analyzeFileContent(file, context);

        setItems(prev => prev.map(i => i.id === file.id ? { 
            ...i, 
            analysisStatus: AnalysisStatus.COMPLETED,
            aiSummary: summary,
            analysisProgress: 100
        } : i));
    };

    const handleUpdateItem = (id: string, updates: Partial<FileSystemItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleRenameSubmit = (id: string, newName: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
        setRenamingId(null);
    };

    const handleDoubleClick = (item: FileSystemItem) => {
        if (item.type === ItemType.FOLDER || item.type === ItemType.SMART_FOLDER) {
            setDirection(1); // Down
            setCurrentPath(item.id);
            setSelection([]);
        } else {
             setPreviewItem(item);
        }
    };

    const handleNavigateUp = () => {
        if (!currentPath) return;
        setDirection(-1); // Up
        const curr = items.find(i => i.id === currentPath);
        setCurrentPath(curr?.parentId || null);
        setSelection([]);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Toggle the panel
    const toggleCasePanel = () => {
        if (activeCaseId) {
            setActiveCaseId(null);
        } else if (smartContextId) {
            setActiveCaseId(smartContextId);
        }
    };

    // If active case ID is set, get data
    const activeCaseFolder = activeCaseId ? items.find(i => i.id === activeCaseId) : null;
    const activeCaseData = activeCaseId ? cases[activeCaseId] : null;

    // Recursive file fetch
    const getCaseFiles = (folderId: string): FileSystemItem[] => {
        const children = items.filter(i => i.parentId === folderId);
        let results = children.filter(i => i.type === ItemType.FILE || i.type === ItemType.NOTE);
        children.filter(i => i.type === ItemType.FOLDER).forEach(f => {
            results = [...results, ...getCaseFiles(f.id)];
        });
        return results;
    };
    const activeCaseFiles = activeCaseId ? getCaseFiles(activeCaseId) : [];

    // --- Drag and Drop Handlers for Container ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
             setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files) as File[];
            await processUploadedFiles(files);
        }
    };

    // Calculate selection box style
    const getSelectionBoxStyle = () => {
        if (!selectionBox) return {};
        const startX = selectionBox.start.x;
        const startY = selectionBox.start.y;
        const curX = selectionBox.current.x;
        const curY = selectionBox.current.y;

        const left = Math.min(startX, curX);
        const top = Math.min(startY, curY);
        const width = Math.abs(startX - curX);
        const height = Math.abs(startY - curY);

        return { left, top, width, height };
    };

    const handleItemClick = (e: React.MouseEvent, item: FileSystemItem) => {
        // If no drag occurred, and no modifiers, this click selects just this item
        if (!hasMovedRef.current && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            setSelection([item.id]);
        }
    };

    return (
        <div 
            className={`w-full h-full relative overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-black text-white selection:bg-blue-500/50' : 'bg-gray-100 text-gray-900 selection:bg-blue-200'}`}
            onContextMenu={handleContextMenu}
            onMouseDown={handleContainerMouseDown} // Attach box select trigger
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            ref={containerRef}
            tabIndex={0} // Make container focusable for shortcuts if needed, though window listener handles it
        >
            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    onClose={() => setContextMenu(null)}
                    onCreateFolder={() => handleCreateItem(ItemType.FOLDER)}
                    onCreateSmartFolder={() => handleCreateItem(ItemType.SMART_FOLDER)}
                    onCreateNote={() => handleCreateItem(ItemType.NOTE)}
                    onRename={() => {
                        if (selection.length === 1) setRenamingId(selection[0]);
                        setContextMenu(null);
                    }}
                    onDelete={handleDelete}
                    onUpload={() => fileInputRef.current?.click()}
                    onSort={handleSort}
                    onToggleTheme={() => setIsDark(prev => !prev)}
                    onToggleLang={() => setLang(l => l === 'EN' ? 'CN' : 'EN')}
                    canCreateSmartFolder={!smartContextId}
                    hasSelection={selection.length > 0}
                    isDark={isDark}
                    t={t}
                />
            )}

            {/* Hidden Input for Context Menu Upload */}
            <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.tsv,.jpg,.jpeg,.png,.tiff,.tif,.bmp,.heic,.mp3,.wav,.m4a,.mp4,.avi,.mov,.mkv,.eml,.msg,.html,.json,.zip,.rar,.7z,.dat,.opt,.lfp,.xml,.mdb,.sqlite"
            />

            {/* Top Bar */}
            <div className={`h-12 border-b flex items-center px-4 justify-between z-30 shrink-0 backdrop-blur-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-300'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={handleNavigateUp} disabled={!currentPath} className={`p-1.5 rounded-full transition-colors ${!currentPath ? 'text-gray-400 opacity-50' : isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-900'}`}>
                             <ChevronLeft />
                        </button>
                    </div>
                    <span className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {currentPath ? (
                           <>
                             <Folder size={16} /> 
                             {items.find(i => i.id === currentPath)?.name}
                             {isSmartFolder(currentPath) && <span className="bg-purple-500/20 text-purple-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">{t.caseActive}</span>}
                           </>
                        ) : t.desktop}
                    </span>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className={`flex-1 relative w-full h-full custom-scrollbar bg-cover bg-center overflow-hidden transition-colors duration-500`} 
                 style={{ 
                     backgroundImage: isDark 
                        ? 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)' 
                        : 'radial-gradient(circle at 50% 50%, #f3f4f6 0%, #e5e7eb 100%)' 
                 }}>
                 
                 {/* Selection Box Render */}
                 {isBoxSelecting && selectionBox && (
                    <div 
                        className="absolute bg-blue-500/20 border border-blue-500/50 z-50 pointer-events-none"
                        style={getSelectionBoxStyle()}
                    />
                 )}

                 {/* Drag Overlay */}
                 <AnimatePresence>
                     {isDragOver && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-2xl flex flex-col items-center justify-center pointer-events-none"
                        >
                             <UploadCloud size={64} className="mb-4 animate-bounce text-blue-500" />
                             <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.dropFiles}</h2>
                        </motion.div>
                     )}
                 </AnimatePresence>

                 {/* Grid Content */}
                 <AnimatePresence custom={direction} mode="popLayout">
                    <motion.div 
                        key={currentPath || 'root'}
                        custom={direction}
                        variants={folderVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {currentFolderItems.map(item => (
                            <FileIconComponent 
                                key={item.id}
                                item={item}
                                isSelected={selection.includes(item.id)}
                                isDropTarget={dragTargetId === item.id}
                                isRenaming={renamingId === item.id}
                                isDark={isDark}
                                onSelect={(e) => {
                                    if (e.metaKey || e.ctrlKey) {
                                        setSelection(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                    } else {
                                        // If clicking an item already selected, keep group (for potential drag)
                                        // If not selected, select it (and clear others)
                                        setSelection(prev => {
                                            if (prev.includes(item.id)) return prev;
                                            return [item.id];
                                        });
                                    }
                                }}
                                onClick={(e) => handleItemClick(e, item)}
                                onDoubleClick={() => handleDoubleClick(item)}
                                onDragStart={handleDragStart}
                                onRenameSubmit={handleRenameSubmit}
                                onRenameStart={(id) => setRenamingId(id)}
                            />
                        ))}
                    </motion.div>
                 </AnimatePresence>
            </div>

            {/* Floating Action Button (Only in Smart Context) */}
            <AnimatePresence>
                {smartContextId && !activeCaseId && (
                    <motion.button
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleCasePanel}
                        className="absolute bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl flex items-center justify-center text-white"
                    >
                        <MessageSquare size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* AI Panel Overlay */}
            <AnimatePresence>
                {activeCaseId && activeCaseFolder && activeCaseData && (
                    <CasePanel 
                        caseData={activeCaseData}
                        caseFolder={activeCaseFolder}
                        files={activeCaseFiles}
                        onUpdateCaseData={(id, data) => setCases(prev => ({ ...prev, [id]: { ...prev[id], ...data } }))}
                        onClose={() => setActiveCaseId(null)}
                        isDark={isDark}
                        t={t}
                    />
                )}
            </AnimatePresence>

             {/* File/Note Preview Modal */}
            <AnimatePresence>
                {previewItem && (
                    <FilePreviewModal
                        item={previewItem}
                        onClose={() => setPreviewItem(null)}
                        onSave={handleUpdateItem}
                        isDark={isDark}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileSystem;