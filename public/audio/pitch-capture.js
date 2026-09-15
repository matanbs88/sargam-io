/* Capture only. Heavy pitch estimation runs in a Worker, not the audio thread. */
class PitchCapture extends AudioWorkletProcessor {
  constructor() { super(); this.buffer = new Float32Array(4096); this.index = 0; }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (const sample of channel) {
      this.buffer[this.index++] = sample;
      if (this.index === this.buffer.length) {
        this.port.postMessage({ samples: this.buffer, sampleRate }, [this.buffer.buffer]);
        this.buffer = new Float32Array(4096); this.index = 0;
      }
    }
    return true;
  }
}
registerProcessor("sargam-pitch-capture", PitchCapture);
