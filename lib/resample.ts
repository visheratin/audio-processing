export const resampleBuffer = async (
  buffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> => {
  if (targetSampleRate < 8000 || targetSampleRate > 192000) {
    throw Error("Sample rate must be in range [8000, 192000].");
  }
  var audioCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.duration * targetSampleRate,
    targetSampleRate
  );
  var audioSrc = audioCtx.createBufferSource();
  audioSrc.buffer = buffer;
  audioSrc.connect(audioCtx.destination);
  audioSrc.start();
  const resampled = await audioCtx.startRendering();
  return resampled;
};
