const pointwiseMultiply = (array1: Float32Array, array2: Float32Array) => {
  let out = new Float32Array(array1.length);
  for (let i = 0; i < array1.length; i++) {
    out[i] = array2[i] * array1[i];
  }
  return out;
};

export default pointwiseMultiply;
