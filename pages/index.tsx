import Head from "next/head";
import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { resampleBuffer } from "../lib/resample";
import stft from "../lib/stft";
import melSpectrogram from "../lib/mel";
// import { melSpectrogram } from "../lib/audio_utils";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const windowSizeRef = useRef<HTMLInputElement>(null);
  const strideSizeRef = useRef<HTMLInputElement>(null);
  const resampleRateRef = useRef<HTMLInputElement>(null);
  const melBinsRef = useRef<HTMLInputElement>(null);
  const minFreqRef = useRef<HTMLInputElement>(null);
  const maxFreqRef = useRef<HTMLInputElement>(null);

  const [originalSampleRate, setOriginalSampleRate] = useState({
    value: 0,
  });
  const [originalLength, setOriginalLength] = useState({
    value: 0,
  });
  const [resampledLength, setResampledLength] = useState({
    value: 0,
  });
  const [inputBuffer, setInputBuffer] = useState<AudioBuffer | null>(null);

  const setPlayer = () => {
    if (
      fileSelectRef.current &&
      fileSelectRef.current.files &&
      fileSelectRef.current.files[0] &&
      audioRef.current
    ) {
      const extension = fileSelectRef.current.files[0]!.name.split(
        "."
      ).pop() as string;
      var reader = new FileReader();
      reader.onload = async () => {
        if (reader.result === null) {
          return;
        }
        const blob = new Blob([reader.result], { type: "audio/" + extension });
        audioRef.current!.src = window.URL.createObjectURL(blob);

        const targetRate = Number(resampleRateRef.current?.value);
        const audioContext = new window.AudioContext({
          sampleRate: targetRate,
        });
        audioContext.decodeAudioData(
          reader.result as ArrayBuffer,
          (buffer: AudioBuffer) => {
            setInputBuffer(buffer);
          }
        );
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  const processFile = () => {
    if (
      fileSelectRef.current &&
      fileSelectRef.current.files &&
      fileSelectRef.current.files[0] &&
      audioRef.current
    ) {
      var reader = new FileReader();
      reader.onload = async () => {
        if (reader.result === null) {
          return;
        }
        const targetRate = Number(resampleRateRef.current?.value);
        const audioContext = new window.AudioContext({
          sampleRate: targetRate,
        });
        audioContext.decodeAudioData(
          reader.result as ArrayBuffer,
          resampleAudio
        );
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  const resampleAudio = async (buffer: AudioBuffer) => {
    setInputBuffer(buffer);
    // setOriginalLength({ value: buffer.length });
    // setOriginalSampleRate({ value: buffer.sampleRate });
    // const targetRate = Number(resampleRateRef.current?.value);
    // if (targetRate < 8000 || targetRate > 192000) {
    //   alert("Sample rate must be in range [8000, 192000].");
    //   return;
    // }
    // const resampled = await resampleBuffer(buffer, targetRate);
    // setResampledLength({ value: resampled.length });
    // setInputBuffer(resampled);
  };

  const playResampled = () => {
    const audioContext = new window.AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = inputBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const generateSpectrogram = () => {
    if (inputBuffer === null || inputBuffer.length == 0) {
      return;
    }
    const targetRate = Number(resampleRateRef.current?.value);
    const data = inputBuffer.getChannelData(0);
    const windowSize = Number(windowSizeRef.current!.value);
    const fftSize = (windowSize / 1000) * targetRate;
    const strideSize = Number(strideSizeRef.current!.value);
    const hopSize = (strideSize / 1000) * targetRate;
    const stftOutput = stft(data, fftSize, hopSize);
    const melBins = Number(melBinsRef.current?.value);
    const minFreq = Number(minFreqRef.current?.value);
    const maxFreq = Number(maxFreqRef.current?.value);
    const msp = melSpectrogram(stftOutput);
    plotSpectrogram(msp, strideSize);
  };

  const plotSpectrogram = (stft: Float32Array[], samplesPerSlice: number) => {
    let zArr: number[][] = [];
    for (let i = 0; i < stft.length; i++) {
      for (let j = 0; j < stft[0].length; j++) {
        if (zArr[j] === undefined) {
          zArr[j] = [];
        }
        zArr[j][i] = stft[i][j];
      }
    }
    const xArr = stft.map((value, index) => (index * samplesPerSlice) / 1000);
    const yArr = [...Array(40).keys()];

    const data = [
      {
        x: xArr,
        y: yArr,
        z: zArr,
        type: "heatmap",
      },
    ];
    const layout = {
      title: "Log-mel spectrogram",
      xaxis: {
        title: "Time, s",
      },
      yaxis: {
        title: "Mel bin",
      },
    };
    const Plotly = require("plotly.js-dist-min");
    Plotly.newPlot("plotDiv", data, layout);
  };

  return (
    <>
      <Head>
        <title>Audio processing app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col-sm-6"></div>
          </div>
          <h1>Audio processing example</h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <h3>File selection</h3>
            <div className="row mb-3">
              <div className="col-sm-6">
                <label className="form-label">Select a file</label>
                <input
                  className="form-control"
                  type="file"
                  ref={fileSelectRef}
                  onChange={setPlayer}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-6">
                <label className="form-label">Audio player</label>
                <audio controls className="form-control" ref={audioRef}></audio>
              </div>
            </div>
            <hr />
            <h3>Resampling</h3>
            <div className="row mb-3">
              <div className="col-sm-2">
                <label className="form-label">Resample rate (Hz)</label>
                <input
                  type="number"
                  className="form-control"
                  ref={resampleRateRef}
                  defaultValue="16000"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={processFile}
                >
                  Process
                </button>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-2">
                <label className="form-label">Original sample rate (Hz)</label>
                <input
                  type="number"
                  className="form-control"
                  value={originalSampleRate.value}
                  disabled
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Original length (frames)</label>
                <input
                  type="number"
                  className="form-control"
                  value={originalLength.value}
                  disabled
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Resampled length (frames)</label>
                <input
                  type="number"
                  className="form-control"
                  value={resampledLength.value}
                  disabled
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={playResampled}
                >
                  Play resampled audio
                </button>
              </div>
            </div>
            <hr />
            <h3>Log-mel spectrogram</h3>
            <div className="row mb-3">
              <div className="col-sm-2">
                <label className="form-label">Window size (ms)</label>
                <input
                  type="number"
                  className="form-control"
                  ref={windowSizeRef}
                  defaultValue="25"
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Stride size (ms)</label>
                <input
                  type="number"
                  className="form-control"
                  ref={strideSizeRef}
                  defaultValue="10"
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Mel bins</label>
                <input
                  type="number"
                  className="form-control"
                  ref={melBinsRef}
                  defaultValue="80"
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Min frequency (Hz)</label>
                <input
                  type="number"
                  className="form-control"
                  ref={minFreqRef}
                  defaultValue="0"
                />
              </div>
              <div className="col-sm-2">
                <label className="form-label">Max frequency (Hz)</label>
                <input
                  type="number"
                  className="form-control"
                  ref={maxFreqRef}
                  defaultValue="8000"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-sm-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={generateSpectrogram}
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="row mb-3">
              <div id="plotDiv"></div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
