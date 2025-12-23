export enum ItemType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  SMART_FOLDER = 'SMART_FOLDER',
  NOTE = 'NOTE',
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Position {
  x: number;
  y: number;
}

export interface FileSystemItem {
  id: string;
  parentId: string | null; // null means root (Desktop)
  name: string;
  type: ItemType;
  content?: string; // For notes or text files
  mimeType?: string; // For files
  size?: string;
  position: Position;
  createdAt: number;
  
  // AI Specifics
  analysisStatus: AnalysisStatus;
  analysisProgress: number; // 0-100
  aiSummary?: string;
  aiTags?: string[];
}

export interface CaseData {
  id: string; // Corresponds to the Smart Folder ID
  scenario: string;
  confidenceScore: number; // 0-100
  pendingQuestions: string[];
  chatHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewMode = 'GRID' | 'LIST';

export interface DragItem {
  id: string;
  offsetX: number;
  offsetY: number;
}