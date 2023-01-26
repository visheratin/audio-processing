import { readMelFilterbank } from "./filterbank";
import pointwiseMultiply from "./util";

const melSpectrogram = (stftOutput: Float32Array[]) => {
  const filterbank = readMelFilterbank();
  const result = [];
  for (let i = 0; i < stftOutput.length; i++) {
    result[i] = applyFilterbank(stftOutput[i], filterbank);
  }
  let maxVal = -1e10;
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].length; j++) {
      if (result[i][j] > maxVal) {
        maxVal = result[i][j];
      }
    }
  }
  maxVal -= 8;
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].length; j++) {
      if (result[i][j] < maxVal) {
        result[i][j] = maxVal;
      }
      result[i][j] = (result[i][j] + 4) / 4;
    }
  }
  let min = 1e10,
    max = -1e10;
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].length; j++) {
      if (result[i][j] < min) {
        min = result[i][j];
      }
      if (result[i][j] > max) {
        max = result[i][j];
      }
    }
  }
  return result;
};

const applyFilterbank = (
  fftEnergies: Float32Array,
  filterbank: Float32Array[]
): Float32Array => {
  let out = new Float32Array(filterbank.length);
  for (let i = 0; i < filterbank.length; i++) {
    const win = pointwiseMultiply(fftEnergies, filterbank[i]);
    let minVal = 1e-10;
    let value = sum(win);
    if (value < minVal) {
      value = minVal;
    }
    out[i] = Math.log10(value);
  }
  return out;
};

const sum = (array: Float32Array) => {
  return array.reduce(function (a, b) {
    return a + b;
  });
};

export default melSpectrogram;
