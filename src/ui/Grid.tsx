import type { JSX } from 'react'
import type { CellPosition, Grid as LifeGrid } from '../life'

interface GridProps {
  grid: LifeGrid
  noteLabels: string[][]
  onToggleCell: (position: CellPosition) => void
  showNoteNames: boolean
}

const Grid = ({ grid, noteLabels, onToggleCell, showNoteNames }: GridProps): JSX.Element => {
  const columns = grid[0]?.length ?? 0

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grid.map((row, y) =>
        row.map((alive, x) => {
          const label = noteLabels[y]?.[x] ?? ''
          const ariaBase = `列 ${x + 1} 行 ${y + 1} は${alive ? '生' : '死'}`
          const ariaLabel = showNoteNames && label ? `${ariaBase}（階名 ${label}）` : ariaBase
          return (
            <button
              key={`${x}-${y}`}
              type="button"
              className={`cell${alive ? ' cell--alive' : ''}`}
              onClick={() => onToggleCell({ x, y })}
              aria-label={ariaLabel}
              aria-pressed={alive}
            >
              {showNoteNames ? <span className="cell__label">{label}</span> : null}
            </button>
          )
        }),
      )}
    </div>
  )
}

export default Grid
