import { estimatePitch } from "../lib/pitchDetection";
self.onmessage = (event: MessageEvent<{ samples: Float32Array; sampleRate: number }>) => {
  self.postMessage(estimatePitch(event.data.samples, event.data.sampleRate));
};
