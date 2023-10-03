import * as SQLite from 'wa-sqlite'

import { SqlValue, Statement } from '../../util'
import { QueryExecResult } from '../util/results'
import type { DatabaseWorkerAPI } from './databaseWorker'

import { Mutex } from 'async-mutex'

const emptyResult = {
  columns: [],
  values: [],
}

export interface Database {
  name: string
  exec(statement: Statement): Promise<QueryExecResult>
  getRowsModified(): Promise<number>
}

export type VFSName =
  | 'InMemory'
  | 'IDBBatchAtomic'
  | 'Default'
  | 'OriginPrivateFileSystem'
  | 'AccessHandlePool'

export class ElectricDatabase implements Database {
  mutex: Mutex

  // Do not use this constructor directly.
  // Create a Database instance using the static `init` method instead.
  private constructor(
    public name: string,
    private sqlite3: SQLiteAPI,
    private db: number
  ) {
    this.mutex = new Mutex()
  }

  async exec(statement: Statement): Promise<QueryExecResult> {
    // Uses a mutex to ensure that the execution of SQL statements is not interleaved
    // otherwise wa-sqlite may encounter problems such as indices going out of bounds
    const release = await this.mutex.acquire()

    // const start = performance.now()

    const str = this.sqlite3.str_new(this.db, statement.sql)
    let prepared
    try {
      prepared = await this.sqlite3.prepare_v2(
        this.db,
        this.sqlite3.str_value(str)
      )
    } finally {
      release()
    }

    if (prepared === null) {
      release()
      return emptyResult
    }

    const stmt = prepared.stmt
    try {
      if (typeof statement.args !== 'undefined') {
        this.sqlite3.bind_collection(
          stmt,
          statement.args as
            | { [index: string]: SQLiteCompatibleType }
            | SQLiteCompatibleType[]
        )
      }

      const rows: SqlValue[][] = []
      let cols: string[] = []

      while ((await this.sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        cols = cols.length === 0 ? this.sqlite3.column_names(stmt) : cols
        const row = this.sqlite3.row(stmt) as SqlValue[]
        rows.push(row)
      }

      return {
        columns: cols,
        values: rows,
      }
    } finally {
      await this.sqlite3.finalize(stmt)

      // const end = performance.now()
      // console.log(`[wa-sqlite] exec took ${end - start}ms`, statement)

      release()
    }
  }

  async getRowsModified() {
    return this.sqlite3.changes(this.db)
  }

  // Creates and opens a DB backed by selected VFS
  static async init(
    dbName: string,
    sqliteDistPath: string,
    vfsName: VFSName = 'IDBBatchAtomic',
    inWorker?: boolean,
    workerUrl?: URL
  ) {
    if (inWorker) {
      console.log('Initializing worker database')
      return this.initWorkerDatabase(dbName, sqliteDistPath, vfsName, workerUrl)
    }
    // Initialize the DB - default to IDBBatchAtomic VFS
    switch (vfsName) {
      case 'Default':
        return this.initDefault(dbName, sqliteDistPath)
      case 'InMemory':
        return this.initInMemory(dbName, sqliteDistPath)
      case 'IDBBatchAtomic':
        return this.initIDBBatchAtomic(dbName, sqliteDistPath)
      case 'OriginPrivateFileSystem':
        return this.initOriginPrivateFileSystem(dbName, sqliteDistPath)
      case 'AccessHandlePool':
        return this.initAccessHandlePool(dbName, sqliteDistPath)
    }
  }

  static async initDefault(dbName: string, sqliteDistPath: string) {
    // Import the synchronous WASM build because we will be using an in-memory VFS
    // and the synchronous build is faster than the async build
    const SQLiteESMFactory = (await import('wa-sqlite/dist/wa-sqlite.mjs'))
      .default

    const SQLiteModule = await SQLiteESMFactory({
      locateFile: (path: string) => {
        return sqliteDistPath + path
      },
    })
    const sqlite3 = SQLite.Factory(SQLiteModule)
    const db = await sqlite3.open_v2(dbName)
    return new ElectricDatabase(dbName, sqlite3, db)
  }

  static async initInMemory(dbName: string, sqliteDistPath: string) {
    // Import the synchronous WASM build because we will be using an in-memory VFS
    // and the synchronous build is faster than the async build
    const SQLiteESMFactory = (await import('wa-sqlite/dist/wa-sqlite.mjs'))
      .default
    // Import the in-memory VFS
    const { MemoryVFS } = await import('wa-sqlite/src/examples/MemoryVFS.js')

    // Initialize SQLite
    const SQLiteModule = await SQLiteESMFactory({
      locateFile: (path: string) => {
        return sqliteDistPath + path
      },
    })

    const sqlite3 = SQLite.Factory(SQLiteModule)

    const vfs = new MemoryVFS() as any
    await vfs.isReady
    sqlite3.vfs_register(vfs, true)

    const db = await sqlite3.open_v2(dbName)
    return new ElectricDatabase(dbName, sqlite3, db)
  }

  static async initIDBBatchAtomic(dbName: string, sqliteDistPath: string) {
    // Import the asynchronous WASM build because we will be using IndexedDB
    // which is an async Virtual File System (VFS).
    const SQLiteAsyncESMFactory = (
      await import('wa-sqlite/dist/wa-sqlite-async.mjs')
    ).default

    const { IDBBatchAtomicVFS } = await import(
      'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
    )

    const SQLiteAsyncModule = await SQLiteAsyncESMFactory({
      locateFile: (path: string) => {
        return sqliteDistPath + path
      },
    })

    const sqlite3 = SQLite.Factory(SQLiteAsyncModule)

    const vfs = new IDBBatchAtomicVFS(dbName) as any
    await vfs.isReady
    sqlite3.vfs_register(vfs, true)

    const db = await sqlite3.open_v2(
      dbName,
      SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE,
      dbName
    )
    return new ElectricDatabase(dbName, sqlite3, db)
  }

  static async initOriginPrivateFileSystem(
    dbName: string,
    sqliteDistPath: string
  ) {
    // Import the asynchronous WASM build because we will be using OPFS which is
    // async.
    const SQLiteAsyncESMFactory = (
      await import('wa-sqlite/dist/wa-sqlite-async.mjs')
    ).default

    const { OriginPrivateFileSystemVFS } = await import(
      'wa-sqlite/src/examples/OriginPrivateFileSystemVFS.js'
    )

    const SQLiteAsyncModule = await SQLiteAsyncESMFactory({
      locateFile: (path: string) => {
        return sqliteDistPath + path
      },
    })

    const sqlite3 = SQLite.Factory(SQLiteAsyncModule)

    const vfs = new OriginPrivateFileSystemVFS(dbName) as any
    await vfs.isReady
    sqlite3.vfs_register(vfs, true)

    const db = await sqlite3.open_v2(dbName)
    return new ElectricDatabase(dbName, sqlite3, db)
  }

  static async initAccessHandlePool(dbName: string, sqliteDistPath: string) {
    // Import the synchronous WASM build because we will be using the 
    // AccessHandlePool VFS which is synchronous.
    const SQLiteESMFactory = (await import('wa-sqlite/dist/wa-sqlite.mjs'))
      .default

    const { AccessHandlePoolVFS } = await import(
      'wa-sqlite/src/examples/AccessHandlePoolVFS.js'
    )

    const SQLiteAsyncModule = await SQLiteESMFactory({
      locateFile: (path: string) => {
        return sqliteDistPath + path
      },
    })

    const sqlite3 = SQLite.Factory(SQLiteAsyncModule)

    const vfs = new AccessHandlePoolVFS(dbName) as any
    await vfs.isReady
    sqlite3.vfs_register(vfs, true)

    const db = await sqlite3.open_v2(dbName)
    return new ElectricDatabase(dbName, sqlite3, db)
  }

  static async initWorkerDatabase(
    dbName: string,
    sqliteDistPath: string,
    vfsName: VFSName = 'IDBBatchAtomic',
    workerUrl?: URL
  ): Promise<Database> {
    const Comlink = await import('comlink')
    if (workerUrl === undefined) {
      workerUrl = new URL('./databaseWorker.ts', import.meta.url)
    }
    const worker = new Worker(workerUrl, {
      type: 'module',
    })
    const workerAPI = Comlink.wrap<DatabaseWorkerAPI>(worker)
    await workerAPI.init(dbName, sqliteDistPath, vfsName)
    return {
      name: dbName,
      exec: workerAPI.exec,
      getRowsModified: workerAPI.getRowsModified,
    }
  }
}
