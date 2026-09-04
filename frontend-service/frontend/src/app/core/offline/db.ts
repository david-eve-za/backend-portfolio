import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDraft {
  id: string;
  projectId: string;
  chapterId: string;
  originalText: string;
  translatedText: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  lastModified: number;
  synced: boolean;
  version: number;
}

interface OfflineProject {
  id: string;
  title: string;
  data: any;
  lastModified: number;
  synced: boolean;
}

interface OfflineGlossary {
  id: string;
  projectId: string;
  term: string;
  translation: string;
  category: string;
  notes: string;
  lastModified: number;
  synced: boolean;
}

interface BookTranslatorDB extends DBSchema {
  drafts: {
    key: string;
    value: OfflineDraft;
    indexes: { 'by-project': string; 'by-synced': boolean; 'by-chapter': string };
  };
  projects: {
    key: string;
    value: OfflineProject;
    indexes: { 'by-synced': boolean };
  };
  glossary: {
    key: string;
    value: OfflineGlossary;
    indexes: { 'by-project': string; 'by-synced': boolean };
  };
}

const DB_NAME = 'booktranslator';
const DB_VERSION = 1;

export async function openBookTranslatorDB(): Promise<IDBPDatabase<BookTranslatorDB>> {
  return openDB<BookTranslatorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Drafts store
      const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
      draftStore.createIndex('by-project', 'projectId');
      draftStore.createIndex('by-synced', 'synced');
      draftStore.createIndex('by-chapter', 'chapterId');

      // Projects store
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('by-synced', 'synced');

      // Glossary store
      const glossaryStore = db.createObjectStore('glossary', { keyPath: 'id' });
      glossaryStore.createIndex('by-project', 'projectId');
      glossaryStore.createIndex('by-synced', 'synced');
    },
    blocked() {
      console.warn('Database upgrade blocked');
    },
    blocking() {
      console.warn('Database blocking');
    },
  });
}

export async function getDB(): Promise<IDBPDatabase<BookTranslatorDB>> {
  return openBookTranslatorDB();
}

export async function closeDB(): Promise<void> {
  // idb doesn't provide a close method, but we can rely on browser cleanup
}