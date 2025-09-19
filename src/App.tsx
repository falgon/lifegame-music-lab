import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import Controls from './ui/Controls'
import Grid from './ui/Grid'
import {
  applyPattern,
  centeredPatternAnchor,
  createGrid,
  dimensionsFromGrid,
  randomizeGrid,
  resizeGrid,
  stepGrid,
  toggleCell,
  type Dimensions,
  type Grid as LifeGrid,
} from './life'
import { PATTERNS } from './patterns'
import { buildNoteEvents, scaleOptions, type ScaleId } from './mapping'
import {
  clearScheduled,
  disposeAudio,
  ensureAudio,
  now,
  pauseTransport,
  playNoteEvents,
  scheduleRepeat,
  setBpm as setTransportBpm,
  startTransport,
  stopTransport,
} from './audio'

const BOARD_OPTIONS: readonly { id: string; label: string; dims: Dimensions }[] = [
  { id: '16x16', label: '16×16', dims: { cols: 16, rows: 16 } },
  { id: '32x18', label: '32×18', dims: { cols: 32, rows: 18 } },
  { id: '48x27', label: '48×27', dims: { cols: 48, rows: 27 } },
]

const INITIAL_BPM = 120
const INITIAL_BOARD = BOARD_OPTIONS[1]

function App(): JSX.Element {
  const [dimensions, setDimensions] = useState<Dimensions>({ ...INITIAL_BOARD.dims })
  const [grid, setGrid] = useState<LifeGrid>(() =>
    createGrid(INITIAL_BOARD.dims.cols, INITIAL_BOARD.dims.rows),
  )
  const [scale, setScale] = useState<ScaleId>('c-major')
  const [bpm, setBpm] = useState(INITIAL_BPM)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [noteCount, setNoteCount] = useState(0)

  const scheduleIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setTransportBpm(bpm)
  }, [bpm])

  const runStep = useCallback(
    (time?: number) => {
      setGrid((current) => {
        const { grid: next, births, survivals } = stepGrid(current)
        const events = buildNoteEvents(births, survivals, scale)
        setGeneration((value) => value + 1)
        setNoteCount(events.length)
        if (events.length > 0) {
          const scheduledTime = time ?? now()
          playNoteEvents(events, scheduledTime)
        }
        return next
      })
    },
    [scale],
  )

  useEffect(() => {
    if (!isPlaying) {
      pauseTransport()
      clearScheduled(scheduleIdRef.current)
      scheduleIdRef.current = undefined
      return
    }

    let cancelled = false
    const start = async (): Promise<void> => {
      await ensureAudio()
      if (cancelled) {
        return
      }
      clearScheduled(scheduleIdRef.current)
      scheduleIdRef.current = scheduleRepeat((time) => runStep(time), '4n')
      startTransport()
    }

    void start()

    return () => {
      cancelled = true
      clearScheduled(scheduleIdRef.current)
      scheduleIdRef.current = undefined
    }
  }, [isPlaying, runStep])

  useEffect(() => {
    return () => {
      clearScheduled(scheduleIdRef.current)
      stopTransport()
      disposeAudio()
    }
  }, [])

  const handleTogglePlay = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    await ensureAudio()
    setIsPlaying(true)
  }, [isPlaying])

  const handleStep = useCallback(async () => {
    await ensureAudio()
    runStep(now())
  }, [runStep])

  const handleRandom = useCallback(() => {
    setGrid(randomizeGrid(dimensions.cols, dimensions.rows))
    setGeneration(0)
    setNoteCount(0)
  }, [dimensions])

  const handleClear = useCallback(() => {
    setGrid(createGrid(dimensions.cols, dimensions.rows))
    setGeneration(0)
    setNoteCount(0)
  }, [dimensions])

  const handleDimensionsChange = useCallback((next: Dimensions) => {
    setDimensions({ ...next })
    setGeneration(0)
    setNoteCount(0)
  }, [])

  const handleToggleCell = useCallback((position: { x: number; y: number }) => {
    setGrid((current) => toggleCell(current, position))
  }, [])

  const handlePatternSelect = useCallback((patternId: string) => {
    const option = PATTERNS.find((pattern) => pattern.id === patternId)
    if (!option) {
      return
    }
    setGrid((current) => {
      const anchor = centeredPatternAnchor(current, option.cells)
      return applyPattern(current, option.cells, anchor)
    })
  }, [])

  useEffect(() => {
    setGrid((current) => resizeGrid(current, dimensions))
  }, [dimensions])

  const gridDimensions = useMemo(() => dimensionsFromGrid(grid), [grid])

  return (
    <div className="app">
      <h1 className="title">Life Music Lab</h1>
      <Controls
        bpm={bpm}
        dimensions={dimensions}
        isPlaying={isPlaying}
        onBpmChange={setBpm}
        onClear={handleClear}
        onDimensionsChange={handleDimensionsChange}
        onPatternSelect={handlePatternSelect}
        onRandom={handleRandom}
        onScaleChange={setScale}
        onStep={handleStep}
        onTogglePlay={handleTogglePlay}
        scale={scale}
        scaleOptions={scaleOptions()}
        patternOptions={PATTERNS}
        boardOptions={BOARD_OPTIONS}
      />
      <Grid grid={grid} onToggleCell={handleToggleCell} />
      <footer className="status">
        <span>世代: {generation}</span>
        <span>同時発音数: {noteCount}</span>
        <span>
          サイズ: {gridDimensions.cols} × {gridDimensions.rows}
        </span>
      </footer>
    </div>
  )
}

export default App
