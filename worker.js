importScripts("sdfglyph.js");

self.onmessage = function (message) {
  const { stackId, buffers } = message.data;
  const fontstack_ptr = Module.ccall("create_fontstack", "number", ["number"], [0]);

  const font_datas = [];

  for (let ab of buffers) {
    let uint8Arr = new Uint8Array(ab);
    const num_bytes = uint8Arr.length * uint8Arr.BYTES_PER_ELEMENT;
    const data_ptr = Module._malloc(num_bytes);
    font_datas.push(data_ptr);
    const data_on_heap = new Uint8Array(
      Module.HEAPU8.buffer,
      data_ptr,
      num_bytes
    );
    data_on_heap.set(uint8Arr);
    Module.ccall(
      "fontstack_add_face",
      null,
      ["number", "number", "number"],
      [fontstack_ptr, data_ptr, num_bytes]
    );
  }

  const s = Module.ccall(
    "fontstack_name",
    "number",
    ["number"],
    [fontstack_ptr]
  );

  let stack_name = UTF8ToString(s);

  for (var i = 0; i < 65536; i += 256) {
    const glyph_buffer_ptr = Module.ccall(
      "generate_glyph_buffer",
      "number",
      ["number", "number"],
      [fontstack_ptr, i]
    );
    const glyph_buffer_data_ptr = Module.ccall(
      "glyph_buffer_data",
      "number",
      ["number"],
      [glyph_buffer_ptr]
    );
    const glyph_buffer_size = Module.ccall(
      "glyph_buffer_size",
      "number",
      ["number"],
      [glyph_buffer_ptr]
    );
    const dst = new ArrayBuffer(glyph_buffer_size);
    let result = new Uint8Array(dst);
    result.set(
      new Uint8Array(
        Module.HEAPU8.buffer,
        glyph_buffer_data_ptr,
        glyph_buffer_size
      )
    );
    Module.ccall("free_glyph_buffer", null, ["number"], [glyph_buffer_ptr]);
    self.postMessage(
      {
        stackId,
        stackName: stack_name,
        glyph: {
          name: `${i}-${i + 255}.pbf`,
          buffer: result,
        },
      },
      [result.buffer]
    );
  }

  for (let data_ptr of font_datas) {
    Module._free(data_ptr);
  }

  Module._free(s);
  Module.ccall("free_fontstack", "number", ["number"], [fontstack_ptr]);
};
