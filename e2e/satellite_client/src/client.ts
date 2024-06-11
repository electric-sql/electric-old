import pg from 'pg'
import SQLiteDatabase from 'better-sqlite3'
import type { Database as BetterSqliteDatabase } from 'electric-sql/node'
import { ElectricConfig, ElectrifyOptions } from 'electric-sql'
import { mockSecureAuthToken } from 'electric-sql/auth/secure'
import type { Database as PgDatabase } from 'electric-sql/node-postgres'
import { setLogLevel } from 'electric-sql/debug'
import { electrify as electrifySqlite } from 'electric-sql/node'
import { electrify as electrifyPg } from 'electric-sql/node-postgres'
import { v4 as uuidv4 } from 'uuid'
import { schema, Electric, ColorType as Color } from './generated/client'
export { JsonNull } from './generated/client'
import { globalRegistry } from 'electric-sql/satellite'
import { QualifiedTablename, SatelliteErrorCode } from 'electric-sql/util'
import { Shape } from 'electric-sql/satellite'
import {
  pgBuilder,
  sqliteBuilder,
  QueryBuilder,
} from 'electric-sql/migrators/builder'

setLogLevel('DEBUG')

let dbName: string
type DB = PgDatabase | BetterSqliteDatabase
const builder: QueryBuilder =
  dialect() === 'Postgres' ? pgBuilder : sqliteBuilder

function dialect(): 'Postgres' | 'SQLite' {
  switch (process.env.DIALECT) {
    case 'Postgres':
    case 'SQLite':
      return process.env.DIALECT
    case '':
    case undefined:
      return 'SQLite'
    default:
      throw new Error(`Unrecognised dialect: ${process.env.DIALECT}`)
  }
}

async function makePgDatabase(): Promise<PgDatabase> {
  const client = new pg.Client({
    host: 'pg_1',
    port: 5432,
    database: dbName,
    user: 'postgres',
    password: 'password',
  })
  dbName = `${client.host}:${client.port}/${client.database}`
  await client.connect()

  return client
}

export const make_db = async (name: string): Promise<DB> => {
  dbName = name
  console.log('DIALECT: ' + process.env.DIALECT)

  switch (dialect()) {
    case 'Postgres':
      return makePgDatabase()
    case 'SQLite':
      return new SQLiteDatabase(name)
  }
}

function isPostgresDb(dialect: string | undefined, _db: DB): _db is PgDatabase {
  return dialect === 'Postgres'
}

export const electrify_db = async (
  db: DB,
  host: string,
  port: number,
  migrations: any,
  connectToElectric: boolean,
  exp?: string
): Promise<Electric> => {
  const config: ElectricConfig = {
    url: `electric://${host}:${port}`,
    debug: true,
    timeout: 30000,
  }
  const opts: ElectrifyOptions = {
    exportTelemetry: true,
    otlpEndpoint: process.env.OTLP_ENDPOINT,
  }
  console.log(`(in electrify_db) config: ${JSON.stringify(config)}`)

  switch (dialect()) {
    case 'Postgres':
      schema.pgMigrations = migrations
      break
    case 'SQLite':
      schema.migrations = migrations
      break
  }

  const electric = isPostgresDb(process.env.DIALECT, db)
    ? await electrifyPg(db, schema, config, opts)
    : await electrifySqlite(db, schema, config, opts)

  const token = await mockSecureAuthToken(exp)

  electric.notifier.subscribeToConnectivityStateChanges((x) =>
    console.log(`Connectivity state changed: ${x.connectivityState.status}`)
  )
  if (connectToElectric) {
    await electric.connect(token) // connect to Electric
  }

  return electric
}

export const disconnect = async (electric: Electric) => {
  await electric.disconnect()
}

// reconnects with Electric, e.g. after expiration of the JWT
export const reconnect = async (electric: Electric, exp: string) => {
  const token = await mockSecureAuthToken(exp)
  await electric.connect(token)
}

export const check_token_expiration = (
  electric: Electric,
  minimalTime: number
) => {
  const start = Date.now()
  const unsubscribe = electric.notifier.subscribeToConnectivityStateChanges(
    (x: any) => {
      if (
        x.connectivityState.status === 'disconnected' &&
        x.connectivityState.reason?.code === SatelliteErrorCode.AUTH_EXPIRED
      ) {
        const delta = Date.now() - start
        if (delta >= minimalTime) {
          console.log(`JWT expired after ${delta} ms`)
        } else {
          console.log(`JWT expired too early, after only ${delta} ms`)
        }
        unsubscribe()
      }
    }
  )
}

export const set_subscribers = (db: Electric) => {
  db.notifier.subscribeToAuthStateChanges((x: any) => {
    console.log('auth state changes: ')
    console.log(x)
  })
  db.notifier.subscribeToPotentialDataChanges((x: any) => {
    console.log('potential data change: ')
    console.log(x)
  })
  db.notifier.subscribeToDataChanges((x: any) => {
    console.log('data changes: ')
    console.log(JSON.stringify(x))
  })
}

export const syncItemsTable = async (
  electric: Electric,
  shapeFilter: string
) => {
  const { synced } = await electric.db.items.sync({ where: shapeFilter })
  return await synced
}

export const syncOtherItemsTable = async (
  electric: Electric,
  shapeFilter: string
) => {
  const { synced } = await electric.db.other_items.sync({ where: shapeFilter })
  return await synced
}

export const syncTable = async (table: string, extraOptions: object) => {
  extraOptions = extraOptions ?? {}
  const satellite = globalRegistry.satellites[dbName]
  const { synced } = await satellite.subscribe([
    { tablename: table, ...extraOptions },
  ])
  return await synced
}

export const lowLevelSubscribe = async (electric: Electric, shape: Shape) => {
  const { synced } = await electric.satellite.subscribe([shape])
  return await synced
}

export const get_tables = (electric: Electric) => {
  return electric.db.rawQuery(builder.getLocalTableNames())
}

export const get_columns = (electric: Electric, table: string) => {
  const namespace = builder.defaultNamespace
  const qualifiedTablename = new QualifiedTablename(namespace, table)
  return electric.db.rawQuery(builder.getTableInfo(qualifiedTablename))
}

export const get_rows = (electric: Electric, table: string) => {
  return electric.db.rawQuery({ sql: `SELECT * FROM ${table};` })
}

export const get_timestamps = (electric: Electric) => {
  return electric.db.timestamps.findMany()
}

type Timestamp = { id: string; created_at: Date; updated_at: Date }
type Datetime = { id: string; d: Date; t: Date }

export const write_timestamp = (electric: Electric, timestamp: Timestamp) => {
  return electric.db.timestamps.create({
    data: timestamp,
  })
}

export const write_datetime = (electric: Electric, datetime: Datetime) => {
  return electric.db.datetimes.create({
    data: datetime,
  })
}

export const get_timestamp = (electric: Electric, id: string) => {
  return electric.db.timestamps.findUnique({
    where: {
      id: id,
    },
  })
}

export const get_datetime = async (electric: Electric, id: string) => {
  const datetime = await electric.db.datetimes.findUnique({
    where: {
      id: id,
    },
  })
  console.log(`Found date time?:\n${JSON.stringify(datetime, undefined, 2)}`)
  return datetime
}

export const assert_timestamp = async (
  electric: Electric,
  id: string,
  expectedCreatedAt: string,
  expectedUpdatedAt: string
) => {
  const timestamp = await get_timestamp(electric, id)
  return check_timestamp(timestamp, expectedCreatedAt, expectedUpdatedAt)
}

export const assert_datetime = async (
  electric: Electric,
  id: string,
  expectedDate: string,
  expectedTime: string
) => {
  const datetime = await get_datetime(electric, id)
  return check_datetime(datetime, expectedDate, expectedTime)
}

export const check_timestamp = (
  timestamp: Timestamp | null,
  expectedCreatedAt: string,
  expectedUpdatedAt: string
) => {
  return (
    (timestamp ?? false) &&
    timestamp!.created_at.getTime() === new Date(expectedCreatedAt).getTime() &&
    timestamp!.updated_at.getTime() === new Date(expectedUpdatedAt).getTime()
  )
}

export const check_datetime = (
  datetime: Datetime | null,
  expectedDate: string,
  expectedTime: string
) => {
  return (
    (datetime ?? false) &&
    datetime!.d.getTime() === new Date(expectedDate).getTime() &&
    datetime!.t.getTime() === new Date(expectedTime).getTime()
  )
}

export const write_bool = (electric: Electric, id: string, b: boolean) => {
  return electric.db.bools.create({
    data: {
      id,
      b,
    },
  })
}

export const get_bool = async (electric: Electric, id: string) => {
  const row = await electric.db.bools.findUnique({
    where: {
      id: id,
    },
  })
  return row?.b
}

export const get_datetimes = (electric: Electric) => {
  return electric.db.datetimes.findMany()
}

export const get_items = (electric: Electric) => {
  return electric.db.items.findMany()
}

export const get_item_ids = (electric: Electric) => {
  return electric.db.items.findMany({
    select: {
      id: true,
    },
  })
}

export const get_uuid = (electric: Electric, id: string) => {
  return electric.db.uuids.findUnique({
    where: {
      id: id,
    },
  })
}

export const get_uuids = (electric: Electric) => {
  return electric.db.uuids.findMany()
}

export const write_uuid = (electric: Electric, id: string) => {
  return electric.db.uuids.create({
    data: {
      id: id,
    },
  })
}

export const get_int = (electric: Electric, id: string) => {
  return electric.db.ints.findUnique({
    where: {
      id: id,
    },
  })
}

export const write_int = (
  electric: Electric,
  id: string,
  i2: number,
  i4: number,
  i8: number | bigint
) => {
  return electric.db.ints.create({
    data: { id, i2, i4, i8 },
  })
}

export const get_float = (electric: Electric, id: string) => {
  return electric.db.floats.findUnique({
    where: {
      id: id,
    },
  })
}

export const write_float = (
  electric: Electric,
  id: string,
  f4: number,
  f8: number
) => {
  return electric.db.floats.create({
    data: {
      id,
      f4,
      f8,
    },
  })
}

export const get_json_raw = async (electric: Electric, id: string) => {
  const res = (await electric.db.rawQuery({
    sql: `SELECT js FROM jsons WHERE id = ${builder.makePositionalParam(1)};`,
    args: [id],
  })) as unknown as Array<{ js: string }>
  return res[0]?.js
}

export const get_jsonb_raw = async (electric: Electric, id: string) => {
  const res = (await electric.db.rawQuery({
    sql: `SELECT jsb FROM jsons WHERE id = ${builder.makePositionalParam(1)};`,
    args: [id],
  })) as unknown as Array<{ jsb: string }>

  const js = res[0]?.jsb

  if (builder.dialect === 'Postgres') {
    return js
  }

  return JSON.parse(js) // SQLite stores JSON as string so parse it
}

export const get_json = async (electric: Electric, id: string) => {
  const res = await electric.db.jsons.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  })
  return res
}

export const get_jsonb = async (electric: Electric, id: string) => {
  const res = await electric.db.jsons.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      jsb: true,
    },
  })
  return res
}

export const write_json = async (electric: Electric, id: string, jsb: any) => {
  return electric.db.jsons.create({
    data: {
      id,
      jsb,
    },
  })
}

export const get_enum = (electric: Electric, id: string) => {
  return electric.db.enums.findUnique({
    where: {
      id: id,
    },
  })
}

export const write_enum = (electric: Electric, id: string, c: Color | null) => {
  return electric.db.enums.create({
    data: {
      id,
      c,
    },
  })
}

export const get_blob = async (electric: Electric, id: string) => {
  const res = await electric.db.blobs.findUnique({
    where: {
      id: id,
    },
  })

  if (res?.blob) {
    // The PG driver returns a NodeJS Buffer but the e2e test matches on a plain Uint8Array.
    // So we convert the Buffer to a Uint8Array.
    // Note that Buffer is a subclass of Uint8Array.
    res.blob = new Uint8Array(res.blob)
  }
  return res
}

export const write_blob = (
  electric: Electric,
  id: string,
  blob: Uint8Array | null
) => {
  return electric.db.blobs.create({
    data: {
      id,
      blob,
    },
  })
}

export const get_item_columns = (
  electric: Electric,
  table: string,
  column: string
) => {
  return electric.db.rawQuery({ sql: `SELECT ${column} FROM ${table};` })
}

export const insert_item = async (electric: Electric, keys: [string]) => {
  const items = keys.map((k) => {
    return {
      id: uuidv4(),
      content: k,
    }
  })

  await electric.db.items.createMany({
    data: items,
  })
}

export const insert_extended_item = async (
  electric: Electric,
  values: Record<string, string>
) => {
  await insert_extended_into(electric, 'items', values)
}

export const insert_extended_into = async (
  electric: Electric,
  table: string,
  values: Record<string, string>
) => {
  if (!values['id']) {
    values['id'] = uuidv4()
  }
  const columns = Object.keys(values)
  const columnNames = columns.join(', ')
  const placeHolders = columns.map((_, i) => builder.makePositionalParam(i + 1))
  const args = Object.values(values)

  await electric.db.unsafeExec({
    sql: `INSERT INTO ${table} (${columnNames}) VALUES (${placeHolders}) RETURNING *;`,
    args: args,
  })
}

export const delete_item = async (electric: Electric, keys: [string]) => {
  for (const key of keys) {
    await electric.db.items.deleteMany({
      where: {
        content: key,
      },
    })
  }
}

export const get_other_items = (electric: Electric) => {
  return electric.db.other_items.findMany()
}

export const insert_other_item = async (electric: Electric, keys: [string]) => {
  const items = keys.map((k) => {
    return {
      id: uuidv4(),
      content: k,
    }
  })

  await electric.db.other_items.createMany({
    data: items,
  })
}

export const delete_other_item = async (electric: Electric, keys: [string]) => {
  for (const key of keys) {
    await electric.db.other_items.deleteMany({
      where: {
        content: key,
      },
    })
  }
}

export const set_item_replication_transform = (electric: Electric) => {
  electric.db.items.setReplicationTransform({
    transformOutbound: (item) => ({
      ...item,
      content: item.content
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) + 1))
        .join(''),
    }),
    transformInbound: (item) => ({
      ...item,
      content: item.content
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) - 1))
        .join(''),
    }),
  })
}

export const stop = async () => {
  await globalRegistry.stopAll()
}
