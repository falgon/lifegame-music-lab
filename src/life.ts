export type Grid = boolean[][]
export interface Dimensions {
  cols: number
  rows: number
}
export interface CellPosition {
  x: number
  y: number
}
export type PatternCell = [number, number]
export type Pattern = PatternCell[]

const neighborDeltas: readonly CellPosition[] = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
]

export interface StepResult {
  grid: Grid
  births: CellPosition[]
  survivals: CellPosition[]
}

export const createGrid = (cols: number, rows: number, fill = false): Grid =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill))

export const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row])

export const dimensionsFromGrid = (grid: Grid): Dimensions => ({
  cols: grid[0]?.length ?? 0,
  rows: grid.length,
})

const inBounds = (grid: Grid, x: number, y: number): boolean =>
  y >= 0 && y < grid.length && x >= 0 && x < (grid[0]?.length ?? 0)

const neighborCount = (grid: Grid, x: number, y: number): number =>
  neighborDeltas.reduce((count, { x: dx, y: dy }) => {
    const nx = x + dx
    const ny = y + dy
    return count + (inBounds(grid, nx, ny) && grid[ny][nx] ? 1 : 0)
  }, 0)

export const stepGrid = (grid: Grid): StepResult => {
  const { cols, rows } = dimensionsFromGrid(grid)
  const births: CellPosition[] = []
  const survivals: CellPosition[] = []

  const next = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      const alive = grid[y][x]
      const neighbors = neighborCount(grid, x, y)

      if (alive && (neighbors === 2 || neighbors === 3)) {
        survivals.push({ x, y })
        return true
      }
      if (!alive && neighbors === 3) {
        births.push({ x, y })
        return true
      }
      return false
    }),
  )

  return { grid: next, births, survivals }
}

export const toggleCell = (grid: Grid, { x, y }: CellPosition): Grid =>
  grid.map((row, rowIndex) =>
    rowIndex === y
      ? row.map((cell, colIndex) => (colIndex === x ? !cell : cell))
      : [...row],
  )

export const clearGrid = (grid: Grid): Grid => {
  const { cols, rows } = dimensionsFromGrid(grid)
  return createGrid(cols, rows)
}

export const randomizeGrid = (cols: number, rows: number, fillRatio = 0.35): Grid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < fillRatio),
  )

export const resizeGrid = (grid: Grid, { cols, rows }: Dimensions): Grid => {
  const current = dimensionsFromGrid(grid)
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) =>
      y < current.rows && x < current.cols ? grid[y][x] : false,
    ),
  )
}

const patternBounds = (pattern: Pattern): Dimensions => {
  const cols = Math.max(...pattern.map(([x]) => x), 0) + 1
  const rows = Math.max(...pattern.map(([, y]) => y), 0) + 1
  return { cols, rows }
}

export const applyPattern = (
  grid: Grid,
  pattern: Pattern,
  anchor: CellPosition,
): Grid => {
  const { cols, rows } = dimensionsFromGrid(grid)
  const cells = new Set(pattern.map(([px, py]) => `${px + anchor.x},${py + anchor.y}`))

  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      if (cells.has(`${x},${y}`)) {
        return true
      }
      return grid[y][x]
    }),
  )
}

export const centeredPatternAnchor = (grid: Grid, pattern: Pattern): CellPosition => {
  const gridDims = dimensionsFromGrid(grid)
  const patternDims = patternBounds(pattern)
  return {
    x: Math.max(Math.floor((gridDims.cols - patternDims.cols) / 2), 0),
    y: Math.max(Math.floor((gridDims.rows - patternDims.rows) / 2), 0),
  }
}

export const alivePositions = (grid: Grid): CellPosition[] => {
  const positions: CellPosition[] = []
  grid.forEach((row, y) =>
    row.forEach((alive, x) => {
      if (alive) {
        positions.push({ x, y })
      }
    }),
  )
  return positions
}
