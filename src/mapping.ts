import type { CellPosition } from './life'

export type ScaleId = 'c-major' | 'a-minor'

export interface ScaleOption {
  id: ScaleId
  label: string
  notes: readonly string[]
}

export type NoteEventKind = 'birth' | 'survival'

export interface NoteEvent {
  note: string
  kind: NoteEventKind
}

const SCALE_DATA: readonly ScaleOption[] = [
  { id: 'c-major', label: 'Cメジャー', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { id: 'a-minor', label: 'Aマイナー', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
]

const SOLFEGE_MAP: Record<string, string> = {
  C: 'ド',
  D: 'レ',
  E: 'ミ',
  F: 'ファ',
  G: 'ソ',
  A: 'ラ',
  B: 'シ',
}

export const scaleOptions = (): readonly ScaleOption[] => SCALE_DATA

const findScaleNotes = (scale: ScaleId): readonly string[] =>
  SCALE_DATA.find(({ id }) => id === scale)?.notes ?? SCALE_DATA[0].notes

const splitNote = (note: string): { pitch: string; octave: string } => {
  const match = note.match(/^[A-G]#?/)
  const pitch = match ? match[0] : note
  const octave = note.slice(pitch.length)
  return { pitch, octave }
}

export const coordinateToNote = (position: CellPosition, scale: ScaleId): string => {
  const notes = findScaleNotes(scale)
  const octave = 3 + Math.floor(position.y / 8)
  const pitch = notes[position.x % notes.length]
  return `${pitch}${octave}`
}

export const noteToSolfege = (note: string): string => {
  const { pitch, octave } = splitNote(note)
  const syllable = SOLFEGE_MAP[pitch] ?? pitch
  return `${syllable}${octave}`
}

export const buildNoteEvents = (
  births: readonly CellPosition[],
  survivals: readonly CellPosition[],
  scale: ScaleId,
): NoteEvent[] => {
  const birthNotes = births.map((cell) => ({
    note: coordinateToNote(cell, scale),
    kind: 'birth' as const,
  }))
  const survivalNotes = survivals.map((cell) => ({
    note: coordinateToNote(cell, scale),
    kind: 'survival' as const,
  }))

  const unique = new Map<string, NoteEvent>()
  ;[...birthNotes, ...survivalNotes].forEach((event) => {
    if (!unique.has(event.note) || event.kind === 'birth') {
      unique.set(event.note, event)
    }
  })

  return Array.from(unique.values())
}
