import pointwiseMultiply from "./util";

const melSpectrogram = (
  stftOutput: Float32Array[],
  melCount = 40,
  lowHz = 300,
  highHz = 8000,
  sampleRate: number
) => {
  const filterbank = generateMelFilterbank(
    stftOutput[0].length,
    melCount,
    lowHz,
    highHz,
    sampleRate
  );
  const result = [];
  for (let i = 0; i < stftOutput.length; i++) {
    result[i] = applyFilterbank(stftOutput[i], filterbank);
  }
  return result;
};

const generateMelFilterbank = (
  fftSize: number,
  melCount: number,
  minHz: number,
  maxHz: number,
  sampleRate: number
) => {
  const minMel = hzToMel(minHz);
  const maxMel = hzToMel(maxHz);
  const mels = linearSpace(minMel, maxMel, melCount + 2);
  const hzs = mels.map((mel: number) => melToHz(mel));
  const bins = hzs.map((hz: number) => hzToBin(hz, fftSize, sampleRate));
  const length = bins.length - 2;
  const filters = [];
  for (let i = 0; i < length; i++) {
    filters[i] = generateFilter(fftSize, bins[i], bins[i + 1], bins[i + 2]);
  }
  return filters;
};

const applyFilterbank = (
  fftEnergies: Float32Array,
  filterbank: Float32Array[]
): Float32Array => {
  let out = new Float32Array(filterbank.length);
  for (let i = 0; i < filterbank.length; i++) {
    const win = pointwiseMultiply(fftEnergies, filterbank[i]);
    out[i] = Math.log(sum(win));
  }
  return out;
};

const hzToMel = (hz: number): number => {
  return 1127.01048 * Math.log(1 + hz / 700);
};

const melToHz = (mel: number): number => {
  return 700 * (Math.exp(mel / 1127.01048) - 1);
};

const hzToBin = (freq: number, fftSize: number, sampleRate: number): number => {
  return Math.floor(((fftSize + 1) * freq) / (sampleRate / 2));
};

const generateFilter = (
  length: number,
  startIndex: number,
  peakIndex: number,
  endIndex: number
): Float32Array => {
  const result = new Float32Array(length);
  const deltaUp = 1.0 / (peakIndex - startIndex);
  for (let i = startIndex; i < peakIndex; i++) {
    result[i] = (i - startIndex) * deltaUp;
  }
  const deltaDown = 1.0 / (endIndex - peakIndex);
  for (let i = peakIndex; i < endIndex; i++) {
    result[i] = 1 - (i - peakIndex) * deltaDown;
  }
  return result;
};

const linearSpace = (start: number, end: number, count: number): number[] => {
  const delta = (end - start) / (count + 1);
  let out = [];
  for (let i = 0; i < count; i++) {
    out[i] = start + delta * i;
  }
  return out;
};

const sum = (array: Float32Array) => {
  return array.reduce(function (a, b) {
    return a + b;
  });
};

export default melSpectrogram;
