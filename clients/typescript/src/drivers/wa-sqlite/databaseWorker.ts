import * as Comlink from 'comlink'
import { ElectricDatabase, type Database, type VFSName } from './database'
import type { Statement } from '../../util'
import type { QueryExecResult } from '../util/results'

let db: Database | null = null

export interface DatabaseWorkerAPI {
  init(dbName: string, sqliteDistPath: string, vfsName: VFSName): Promise<void>
  exec(statement: Statement): Promise<QueryExecResult>
  getRowsModified(): Promise<number>
}

async function init(
  dbName: string,
  sqliteDistPath: string,
  vfsName: VFSName = 'IDBBatchAtomic'
) {
  if (db !== null) {
    throw new Error('Database already initialized')
  }
  db = await ElectricDatabase.init(dbName, sqliteDistPath, vfsName, false)
}

async function exec(statement: Statement): Promise<QueryExecResult> {
  if (db === null) {
    throw new Error('Database not initialized')
  }
  return db.exec(statement)
}

async function getRowsModified(): Promise<number> {
  if (db === null) {
    throw new Error('Database not initialized')
  }
  return db.getRowsModified()
}

Comlink.expose({ init, exec, getRowsModified } satisfies DatabaseWorkerAPI)
