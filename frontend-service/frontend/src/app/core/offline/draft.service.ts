import { Injectable, inject } from '@angular/core';
import { getDB } from './db';

export interface OfflineDraft {
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

export interface OfflineProject {
  id: string;
  title: string;
  data: any;
  lastModified: number;
  synced: boolean;
}

@Injectable({ providedIn: 'root' })
export class DraftService {
  private dbPromise = this.openDB();

  private async openDB() {
    const { openBookTranslatorDB } = await import('./db');
    return openBookTranslatorDB();
  }

  async saveDraft(draft: Omit<OfflineDraft, 'id'>): Promise<string> {
    const db = await this.getDB();
    const id = `${draft.projectId}-${draft.chapterId}`;
    const fullDraft = { ...draft, id } as any;
    await db.put('drafts', fullDraft);
    return id;
  }

  async getDraft(projectId: string, chapterId: string): Promise<any | undefined> {
    const db = await this.getDB();
    const id = `${projectId}-${chapterId}`;
    return db.get('drafts', id);
  }

  async getDraftsByProject(projectId: string): Promise<any[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('drafts', 'by-project', projectId);
  }

  async getUnsyncedDrafts(): Promise<any[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('drafts', 'by-synced', false);
  }

  async markSynced(projectId: string, chapterId: string): Promise<void> {
    const db = await this.getDB();
    const id = `${projectId}-${chapterId}`;
    const draft = await db.get('drafts', id);
    if (draft) {
      draft.synced = true;
      draft.lastModified = Date.now();
      await db.put('drafts', draft);
    }
  }

  async clearSynced(projectId?: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    const index = store.index('by-synced');
    const cursor = await index.openCursor(projectId ? IDBKeyRange.only(projectId) : undefined);
    while (cursor) {
      await cursor.delete();
      await cursor.continue();
    }
    await tx.done;
  }

  async deleteDraft(projectId: string, chapterId: string): Promise<void> {
    const db = await this.getDB();
    const id = `${projectId}-${chapterId}`;
    await db.delete('drafts', id);
  }

  // Project methods
  async saveProject(project: any): Promise<void> {
    const db = await this.getDB();
    await db.put('projects', { ...project, lastModified: Date.now() });
  }

  async getProject(id: string): Promise<any | undefined> {
    const db = await this.getDB();
    return db.get('projects', id);
  }

  async getAllProjects(): Promise<any[]> {
    const db = await this.getDB();
    return db.getAll('projects');
  }

  async markProjectSynced(id: string): Promise<void> {
    const db = await this.getDB();
    const project = await db.get('projects', id);
    if (project) {
      project.synced = true;
      project.lastModified = Date.now();
      await db.put('projects', project);
    }
  }

  // Glossary methods
  async saveGlossaryTerm(term: any): Promise<void> {
    const db = await this.getDB();
    await db.put('glossary', { ...term, lastModified: Date.now() });
  }

  async getGlossaryTerms(projectId: string): Promise<any[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('glossary', 'by-project', projectId);
  }

  async markGlossarySynced(projectId: string): Promise<void> {
    const db = await this.getDB();
    const terms = await db.getAllFromIndex('glossary', 'by-project', projectId);
    const tx = db.transaction('glossary', 'readwrite');
    for (const term of terms) {
      if (!term.synced) {
        term.synced = true;
        term.lastModified = Date.now();
        await tx.store.put(term);
      }
    }
    await tx.done;
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    await Promise.all([
      db.clear('drafts'),
      db.clear('projects'),
      db.clear('glossary'),
    ]);
  }
}