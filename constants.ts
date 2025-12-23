import { 
  FileText, Image, Video, Music, Archive, FileCode, Database, 
  FileSpreadsheet, Mail, Folder, Briefcase, File 
} from 'lucide-react';

export const SUPPORTED_EXTENSIONS = [
  'PDF', 'DOC', 'DOCX', 'TXT', 'RTF', 'ODT', 'XLS', 'XLSX', 'CSV', 'TSV', 
  'JPG', 'JPEG', 'PNG', 'TIFF', 'TIF', 'BMP', 'HEIC', 'MP3', 'WAV', 'M4A', 
  'MP4', 'AVI', 'MOV', 'MKV', 'EML', 'MSG', 'HTML', 'JSON', 'ZIP', 'RAR', 
  '7Z', 'DAT', 'OPT', 'LFP', 'XML', 'MDB', 'SQLITE'
];

export const getIconForFileType = (filename: string, type: string) => {
  if (type === 'FOLDER') return Folder;
  if (type === 'SMART_FOLDER') return Briefcase;
  
  const ext = filename.split('.').pop()?.toUpperCase() || '';
  
  if (['JPG', 'JPEG', 'PNG', 'TIFF', 'BMP', 'HEIC'].includes(ext)) return Image;
  if (['MP4', 'AVI', 'MOV', 'MKV'].includes(ext)) return Video;
  if (['MP3', 'WAV', 'M4A'].includes(ext)) return Music;
  if (['XLS', 'XLSX', 'CSV', 'TSV'].includes(ext)) return FileSpreadsheet;
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return Archive;
  if (['HTML', 'JSON', 'XML', 'JS', 'TS'].includes(ext)) return FileCode;
  if (['MDB', 'SQLITE', 'DAT'].includes(ext)) return Database;
  if (['EML', 'MSG'].includes(ext)) return Mail;
  if (['PDF', 'DOC', 'DOCX', 'RTF', 'ODT', 'TXT'].includes(ext)) return FileText;
  
  return File;
};

export const MOCK_INITIAL_SCENARIO = `Based on the initial intake of documents, this case appears to involve a contractual dispute regarding the "Project Alpha" construction timeline. The evidence suggests a disagreement over force majeure clauses invoked during the supply chain disruption of 2023.`;

export const TRANSLATIONS = {
  EN: {
    desktop: "Desktop",
    caseActive: "Case Active",
    newNote: "New Note",
    addFiles: "Add Files",
    dropFiles: "Drop files to upload",
    newFolder: "New Folder",
    newSmartCase: "New Smart Case",
    rename: "Rename",
    legalMind: "LegalMind OS",
    caseIntel: "Case Intelligence",
    scenario: "Scenario Analysis",
    assistant: "AI Assistant",
    confidence: "Logic Confidence",
    narrative: "Generated Narrative",
    logicGaps: "Logic Gaps Detected",
    askMe: "Ask me anything about the evidence...",
    typeMessage: "Ask legal assistant...",
    editable: "Editable",
    save: "Save",
    previewNotSupported: "Preview not supported",
    caseInitialized: "Case initialized. Waiting for evidence...",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    langEn: "English",
    langCn: "中文",
    autoArrange: "Auto Arrange",
    byName: "By Name",
    byDate: "By Date Added",
    tidyUp: "Tidy Up (As Is)",
    changeLang: "Change Language",
    toggleTheme: "Toggle Theme"
  },
  CN: {
    desktop: "桌面",
    caseActive: "案件进行中",
    newNote: "新建笔记",
    addFiles: "添加文件",
    dropFiles: "拖拽文件上传",
    newFolder: "新建文件夹",
    newSmartCase: "新建智能案件",
    rename: "重命名",
    legalMind: "LegalMind 操作系统",
    caseIntel: "案件智能",
    scenario: "案情分析",
    assistant: "AI 助手",
    confidence: "逻辑置信度",
    narrative: "案情摘要",
    logicGaps: "发现逻辑漏洞",
    askMe: "关于现有证据，您可以问我任何问题...",
    typeMessage: "询问法律助手...",
    editable: "可编辑",
    save: "保存",
    previewNotSupported: "暂不支持预览",
    caseInitialized: "案件已初始化，等待证据...",
    themeDark: "深色模式",
    themeLight: "浅色模式",
    langEn: "English",
    langCn: "中文",
    autoArrange: "自动排列",
    byName: "按名称",
    byDate: "按添加日期",
    tidyUp: "整理 (保持原样)",
    changeLang: "切换语言",
    toggleTheme: "切换主题"
  }
};