import type { AnalysisResult, PrintCalculationInputs } from '../types/analysis'

export interface SavedAnalysisRecord {
  id: string
  fileName: string
  fileSize: number
  savedAt: string
  analysis: AnalysisResult
  costInputs: PrintCalculationInputs
  thumbnail?: string
  stlData?: ArrayBuffer
}

const DB_NAME = 'print-check-db'
const DB_VERSION = 1
const STORE = 'analyses'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function listSavedAnalyses(): Promise<SavedAnalysisRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const records = (request.result as SavedAnalysisRecord[]).sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      )
      resolve(records)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getSavedAnalysis(id: string): Promise<SavedAnalysisRecord | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(id)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function saveAnalysis(record: SavedAnalysisRecord): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const request = tx.objectStore(STORE).put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteSavedAnalysis(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const request = tx.objectStore(STORE).delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
