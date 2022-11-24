importScripts('sdfglyph.js');

self.onmessage = function (e) {
  const uint8Arr = e.data;
  const num_bytes = uint8Arr.length * uint8Arr.BYTES_PER_ELEMENT;
  const data_ptr = Module._malloc(num_bytes);
  const data_on_heap = new Uint8Array(Module.HEAPU8.buffer, data_ptr, num_bytes);
  data_on_heap.set(uint8Arr);
  const result_ptr = Module._malloc(1024 * 1024); // max 1 mb
  for (var i = 0; i < 65536; i += 256) {
      const result_length = Module.ccall('generate_range', null, ['number','number','number'], [data_ptr,num_bytes,i,result_ptr]);
      const dst = new ArrayBuffer(result_length);
      let result = new Uint8Array(dst)
      result.set(new Uint8Array(Module.HEAPU8.buffer, result_ptr, result_length));
      self.postMessage({buffer:result,index:i},[result.buffer]);
  }
  Module._free(result_ptr);
};