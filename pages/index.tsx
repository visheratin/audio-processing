import Head from "next/head";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const windowSizeRef = useRef<HTMLInputElement>(null);
  const strideSizeRef = useRef<HTMLInputElement>(null);
  const resampleRateRef = useRef<HTMLInputElement>(null);

  const [originalSampleRate, setOriginalSampleRate] = useState({
    value: 0,
  });
  const [originalLength, setOriginalLength] = useState({
    value: 0,
  });
  const [resampledLength, setResampledLength] = useState({
    value: 0,
  });

  const setPlayer = () => {
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
        const blob = new Blob([reader.result], { type: "audio/mp3" });
        audioRef.current!.src = window.URL.createObjectURL(blob);
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
        const audioContext = new window.AudioContext();
        audioContext.decodeAudioData(
          reader.result as ArrayBuffer,
          resampleAudio
        );
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  const resampleAudio = (buffer: AudioBuffer) => {
    setOriginalLength({ value: buffer.length });
    setOriginalSampleRate({ value: buffer.sampleRate });
    const targetRate = Number(resampleRateRef.current?.value);
    if (targetRate < 8000 || targetRate > 192000) {
      alert("Sample rate must be in range [8000, 192000].");
      return;
    }
    var audioCtx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.duration * targetRate,
      targetRate
    );
    var audioSrc = audioCtx.createBufferSource();
    audioSrc.buffer = buffer;
    audioSrc.connect(audioCtx.destination);
    audioSrc.start();
    audioCtx.startRendering().then((resampled: AudioBuffer) => {
      setResampledLength({ value: resampled.length });
      const audioContext = new window.AudioContext();
      const source = audioContext.createBufferSource();
      source.buffer = resampled;
      source.connect(audioContext.destination);
      source.start();
    });
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
                <div className="form-text">
                  After loading the resampled audio will be played once.
                </div>
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
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
