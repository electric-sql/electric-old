import { useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { genUUID } from 'electric-sql/util'
import { useElectric } from './ElectricProvider'

import { Tetrominoes as Tetromino, colourSchema, tetrominoSchema } from './generated/client'

import './Example.css'

const angles = [0, 90, 180, 270]

const sample = (array: any[]) => array[Math.floor(Math.random() * array.length)]
const sampleShape = () => sample(Array(tetrominoSchema.Values))
const sampleColour = () => sample(Array(colourSchema.Values))
const sampleAngle = () => sample(angles)

export const Example = () => {
  const { db } = useElectric()!

  useEffect(() => {
    const syncTetrominoes = async () => {
      const shape = await db.tetrominoes.sync()
      await shape.synced
    }

    syncTetrominoes()
  }, [])

  const addPiece = async () => {
    console.log(colourSchema)
    console.log(colourSchema.array())
    console.log(colourSchema.options)
    console.log(Object.keys(colourSchema.Values))
    console.log(Object.keys(tetrominoSchema.Values))
    await db.tetrominoes.create({
      data: {
        id: genUUID(),
        shape: sampleShape(),
        colour: sampleColour(),
        angle: sampleAngle()
      }
    })
  }

  const clearPieces = async () => {
    await db.tetrominoes.deleteMany()
  }

  const liveQuery = useLiveQuery(db.tetrominoes.liveMany())
  const pieces: Tetromino[] = liveQuery.results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addPiece}>
          Add
        </button>
        <button className="button" onClick={clearPieces}>
          Clear
        </button>
      </div>
      {
        pieces.map((piece: Tetromino, index: number) =>
          <p key={index} className="tetromino">
            <code>{piece.id}</code>
            <code>{piece.shape}</code>
            <code>{piece.colour}</code>
            <code>{piece.angle}</code>
          </p>
        )
      }
    </div >
  )
}
