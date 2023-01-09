import * as KissFFT from "kissfft-js";
import pointwiseMultiply from "./util";

const stft = (input: Float32Array, fftSize: number, hopSize: number) => {
  const bufferCount = Math.floor((input.length - fftSize) / hopSize) + 1;
  let matrix = range(bufferCount).map((x) => new Float32Array(fftSize));
  for (let i = 0; i < bufferCount; i++) {
    const ind = i * hopSize;
    const buffer = input.slice(ind, ind + fftSize);
    if (buffer.length != fftSize) {
      continue;
    }
    const hannWindows = hanning(buffer.length);
    const windowBuffer = pointwiseMultiply(buffer, hannWindows);
    const fftResult = fft(windowBuffer);
    matrix[i].set(magnitude(fftResult.slice(0, fftSize)));
  }
  return matrix;
};

const hanning = (length: number) => {
  let win = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (length - 1));
  }
  return win;
};

const fft = (data: Float32Array): Float32Array => {
  const fftRunner = new KissFFT.FFTR(data.length);
  const result = fftRunner.forward(data);
  fftRunner.dispose();
  return result;
};

const magnitude = (y: Float32Array) => {
  let out = new Float32Array(y.length / 2);
  for (let i = 0; i < y.length / 2; i++) {
    out[i] = y[i * 2] * y[i * 2] + y[i * 2 + 1] * y[i * 2 + 1];
  }
  return out;
};

const range = (count: number): number[] => {
  let out = [];
  for (let i = 0; i < count; i++) {
    out.push(i);
  }
  return out;
};

const fftEnergy = (y: Float32Array): Float32Array => {
  let out = new Float32Array(y.length / 2);
  for (let i = 0; i < y.length / 2; i++) {
    out[i] = y[i * 2] * y[i * 2] + y[i * 2 + 1] * y[i * 2 + 1];
  }
  return out;
};

export default stft;
