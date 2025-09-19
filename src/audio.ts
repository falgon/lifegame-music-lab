import * as Tone from 'tone'
import type { NoteEvent } from './mapping'

let synth: Tone.PolySynth<Tone.Synth> | null = null

export const ensureAudio = async (): Promise<void> => {
  await Tone.start()
  if (!synth) {
    const instrument = new Tone.PolySynth(Tone.Synth).toDestination()
    instrument.maxPolyphony = 64
    instrument.set({ volume: -8 })
    synth = instrument
  }
}

export const now = (): number => Tone.now()

export const setBpm = (bpm: number): void => {
  Tone.Transport.bpm.value = bpm
}

export const startTransport = (): void => {
  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start()
  }
}

export const pauseTransport = (): void => {
  if (Tone.Transport.state === 'started') {
    Tone.Transport.pause()
  }
}

export const stopTransport = (): void => {
  Tone.Transport.stop()
  Tone.Transport.position = 0
}

export const clearScheduled = (id: number | undefined): void => {
  if (typeof id === 'number') {
    Tone.Transport.clear(id)
  }
}

export const scheduleRepeat = (
  callback: (time: number) => void,
  interval: string,
): number => Tone.Transport.scheduleRepeat(callback, interval)

export const playNoteEvents = (events: NoteEvent[], time: number): void => {
  const instrument = synth
  if (!instrument || events.length === 0) {
    return
  }

  events.forEach(({ note, kind }) => {
    const duration = kind === 'birth' ? '8n' : '4n'
    const velocity = kind === 'birth' ? 0.8 : 0.5
    instrument.triggerAttackRelease(note, duration, time, velocity)
  })
}

export const disposeAudio = (): void => {
  synth?.dispose()
  synth = null
  Tone.Transport.cancel()
}
