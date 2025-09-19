import type { ChangeEvent, JSX } from 'react'
import type { Dimensions } from '../life'
import type { ScaleId, ScaleOption } from '../mapping'
import type { PatternOption } from '../patterns'

type BoardOption = {
  id: string
  label: string
  dims: Dimensions
}

interface ControlsProps {
  bpm: number
  dimensions: Dimensions
  isPlaying: boolean
  onBpmChange: (value: number) => void
  onClear: () => void
  onDimensionsChange: (value: Dimensions) => void
  onPatternSelect: (id: string) => void
  onRandom: () => void
  onScaleChange: (value: ScaleId) => void
  onShowNoteNamesChange: (value: boolean) => void
  onStep: () => void
  onTogglePlay: () => void
  scale: ScaleId
  scaleOptions: readonly ScaleOption[]
  patternOptions: readonly PatternOption[]
  boardOptions: readonly BoardOption[]
  showNoteNames: boolean
}

const Controls = ({
  bpm,
  dimensions,
  isPlaying,
  onBpmChange,
  onClear,
  onDimensionsChange,
  onPatternSelect,
  onRandom,
  onScaleChange,
  onShowNoteNamesChange,
  onStep,
  onTogglePlay,
  scale,
  scaleOptions,
  patternOptions,
  boardOptions,
  showNoteNames,
}: ControlsProps): JSX.Element => {
  const handleBpmChange = (event: ChangeEvent<HTMLInputElement>) => {
    onBpmChange(Number(event.target.value))
  }

  const handleScaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onScaleChange(event.target.value as ScaleId)
  }

  const handleBoardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = boardOptions.find((option) => option.id === event.target.value)
    if (next) {
      onDimensionsChange(next.dims)
    }
  }

  const handlePatternChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value) {
      onPatternSelect(value)
      event.target.selectedIndex = 0
    }
  }

  const handleNoteNamesToggle = (event: ChangeEvent<HTMLInputElement>) => {
    onShowNoteNamesChange(event.target.checked)
  }

  const currentBoard = boardOptions.find(
    (option) =>
      option.dims.cols === dimensions.cols && option.dims.rows === dimensions.rows,
  )

  return (
    <section className="controls">
      <div className="controls__left">
        <button type="button" onClick={onTogglePlay} className="button">
          {isPlaying ? '⏸ 停止' : '▶︎ 再生'}
        </button>
        <button type="button" onClick={onStep} className="button">
          ⏭ 1ステップ
        </button>
        <label className="slider">
          <span>BPM {bpm}</span>
          <input
            type="range"
            min={60}
            max={180}
            step={1}
            value={bpm}
            onChange={handleBpmChange}
          />
        </label>
      </div>
      <div className="controls__right">
        <label className="select">
          <span>スケール</span>
          <select value={scale} onChange={handleScaleChange}>
            {scaleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="select">
          <span>サイズ</span>
          <select value={currentBoard?.id ?? ''} onChange={handleBoardChange}>
            {boardOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="button-group">
          <button type="button" onClick={onRandom} className="button">
            ランダム
          </button>
          <button type="button" onClick={onClear} className="button">
            クリア
          </button>
        </div>
        <label className="select">
          <span>パターン</span>
          <select defaultValue="" onChange={handlePatternChange}>
            <option value="" disabled>
              パターンを選択
            </option>
            {patternOptions.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.label}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={showNoteNames}
            onChange={handleNoteNamesToggle}
          />
          <span>階名表示</span>
        </label>
      </div>
    </section>
  )
}

export default Controls
