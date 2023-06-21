import { SatelliteError } from '../../util/types'
import { Client } from '../../satellite'

export type TableName = string

export type Shape = {
  tables: TableName[]
}

interface IShapeManager {
  init(satellite: Client): void
  sync(shape: Shape): Promise<void>
  isSynced(table: TableName): boolean
}

class ShapeManager implements IShapeManager {
  protected syncedTables: Set<TableName>
  protected satellite?: Client

  constructor() {
    this.syncedTables = new Set()
  }

  init(satellite: Client) {
    this.satellite = satellite
  }

  async sync(shape: Shape): Promise<void> {
    if (this.satellite === undefined)
      throw new Error("Shape cannot be synced because the `ShapeManager` is not yet initialised.")

    const res = await this.satellite.subscribeToShape(shape)

    if (res instanceof SatelliteError)
      throw new Error("Subscription failed: " + res.message)

    // Now that the subscription is active we can store the synced tables
    shape.tables.forEach(this.syncedTables.add)
  }

  isSynced(table: TableName): boolean {
    return this.syncedTables.has(table)
  }
}

export class ShapeManagerMock extends ShapeManager {
  constructor() {
    super()
  }

  override async sync(shape: Shape): Promise<void> {
    // Do not contact the server but directly store the synced tables
    shape.tables.forEach(tbl => this.syncedTables.add(tbl))
    // method returns and promise will resolve
    // as if the server acknowledged the subscription
  }
}

// a shape manager singleton
export const shapeManager = new ShapeManager()
