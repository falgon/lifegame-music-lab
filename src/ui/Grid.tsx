import type { JSX } from 'react'
import type { CellPosition, Grid as LifeGrid } from '../life'

interface GridProps {
  grid: LifeGrid
  onToggleCell: (position: CellPosition) => void
}

const Grid = ({ grid, onToggleCell }: GridProps): JSX.Element => {
  const columns = grid[0]?.length ?? 0

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grid.map((row, y) =>
        row.map((alive, x) => (
          <button
            key={`${x}-${y}`}
            type="button"
            className={`cell${alive ? ' cell--alive' : ''}`}
            onClick={() => onToggleCell({ x, y })}
            aria-label={`列 ${x + 1} 行 ${y + 1} は${alive ? '生' : '死'}`}
            aria-pressed={alive}
          />
        )),
      )}
    </div>
  )
}

export default Grid
