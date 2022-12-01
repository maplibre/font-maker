import { useState, useEffect } from "react";
import "tachyons/css/tachyons.min.css";
import Pbf from "pbf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

var worker = new Worker("worker.js");

function GlyphRange() {
  return <div></div>;
}

interface RenderedGlyphs {
  name: string;
  buffer: ArrayBuffer;
}

function App() {
  let [rendered, setRendered] = useState<RenderedGlyphs[]>([]);

  function addFont(event:React.ChangeEvent<HTMLInputElement>) {
    const file_reader = new FileReader();
    file_reader.onload = function (loadEvent) {
      const uint8Arr = new Uint8Array(loadEvent.target!.result as ArrayBuffer);
      worker.postMessage(uint8Arr, [uint8Arr.buffer]);
    };
    file_reader.readAsArrayBuffer(event.target!.files![0]);
  }

  useEffect(() => {
    worker.onmessage = function (e) {
      let i = e.data.index;
      setRendered((prevRendered) => {
        return [
          ...prevRendered,
          { name: i + "-" + (i + 255) + ".pbf", buffer: e.data.buffer },
        ];
      });
    };

    return () => {
      worker.onmessage = null;
    };
  }, []);

  function downloadZip(event:React.MouseEvent<HTMLElement>) {
    let fontName = "My Font Name";
    var zip = new JSZip();
    var folder = zip.folder(fontName)!;
    for (var i of rendered) {
      folder.file(i.name, i.buffer);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, fontName + ".zip");
    });
  }

  function loadExample() {
    fetch("NotoSans-Regular.ttf")
      .then((resp) => {
        return resp.arrayBuffer();
      })
      .then((buffer) => {
        const uint8Arr = new Uint8Array(buffer);
        worker.postMessage(uint8Arr, [uint8Arr.buffer]);
      });
  }

  return (
    <div className="sans-serif bg-black flex vh-100" id="app">
      <div className="w-25-l w-50 vh-100 bg-light-gray pa4">
        <h1>Font Maker</h1>
        <div className="bg-light-blue pa2 dim pointer" onClick={loadExample}>
          Load Example (NotoSans-Regular.ttf)
        </div>
        <input className="mt3" type="file" onChange={addFont} />
        <div className="mt4">
          Rendered: {rendered.length}
        </div>
        <div className="progress-bar mt2">
          <span className="progress-bar-fill"></span>
        </div>
        <div
          v-if="done"
          className="bg-blue mt3 pa2 dim pointer"
          onClick={downloadZip}
        >
          Download
        </div>
        <div className="mt4">
          <a href="https://github.com/protomaps/maplibre-font-maker">
            On GitHub
          </a>
        </div>
      </div>
      <div className="w-75-l w-50 overflow-y-scroll white flex flex-column items-center">
        <GlyphRange v-for="file in rendered" />
      </div>
    </div>
  );
}

export default App;
