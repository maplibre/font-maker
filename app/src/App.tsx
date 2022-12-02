import { useState, useEffect, useRef } from "react";
import "tachyons/css/tachyons.min.css";
import Pbf from "pbf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Map, MapRef, NavigationControl, AttributionControl } from "react-map-gl";
import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import { styleFunc } from "./style";

var worker = new Worker("worker.js");

interface RenderedGlyphs {
  name: string;
  buffer: ArrayBuffer;
}

// copied from MapLibre /util/ajax.ts
type RequestParameters = {
  url: string;
  headers?: any;
  method?: "GET" | "POST" | "PUT";
  body?: string;
  type?: "string" | "json" | "arrayBuffer";
  credentials?: "same-origin" | "include";
  collectResourceTiming?: boolean;
};

type ResponseCallback = (
  error?: Error | null,
  data?: any | null,
  cacheControl?: string | null,
  expires?: string | null
) => void;

function App() {
  let [rendered, setRendered] = useState<RenderedGlyphs[]>([]);
  let [textField, setTextField] = useState<string>("{NAME}");
  let [textSize, setTextSize] = useState<number>(16);
  let [stackName, setStackName] = useState<string>("");
  const renderedRef = useRef(rendered);
  const mapRef = useRef(null);

  const onChangeTextField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextField(event.target.value);
  };

  const onChangeTextSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextSize(+event.target.value);
  };

  // make the state accessible in protocol hook.
  useEffect(() => {
    renderedRef.current = rendered;
  });
  let [fontstackName, setFontstackName] = useState<string>("");

  useEffect(() => {
    if (rendered.length == 256) {
      let randomString = Math.random().toString(36).slice(2, 7);
      setFontstackName(randomString);
    }
  }, [rendered]);

  useEffect(() => {
    worker.onmessage = function (e) {
      let i = e.data.index;

      setStackName(e.data.name);
      setRendered((prevRendered) => {
        return [
          ...prevRendered,
          { name: i + "-" + (i + 255) + ".pbf", buffer: e.data.buffer },
        ];
      });
    };

    maplibregl.addProtocol(
      "memfont",
      (params: RequestParameters, callback: ResponseCallback) => {
        const re = new RegExp(/memfont:\/\/(.+)\/(\d+)-(\d+).pbf/);
        const result = params.url.match(re);
        if (result) {
          const fname = result[2] + "-" + result[3] + ".pbf";
          for (let r of renderedRef.current) {
            if (r.name === fname) {
              callback(null, new Uint8Array(r.buffer), null, null);
            }
          }
        }
        callback(null, new Uint8Array(), null, null);
        return {
          cancel: () => {},
        };
      }
    );

    return () => {
      worker.onmessage = null;
      maplibregl.removeProtocol("memfont");
    };
  }, []);

  function downloadZip(event: React.MouseEvent<HTMLElement>) {
    var zip = new JSZip();
    var folder = zip.folder(stackName)!;
    for (var i of rendered) {
      folder.file(i.name, i.buffer);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, stackName + ".zip");
    });
  }

  function addFont(event: React.ChangeEvent<HTMLInputElement>) {
    setRendered([]);
    const file_reader = new FileReader();
    file_reader.onload = function (loadEvent) {
      const uint8Arr = new Uint8Array(loadEvent.target!.result as ArrayBuffer);
      worker.postMessage(uint8Arr, [uint8Arr.buffer]);
    };
    file_reader.readAsArrayBuffer(event.target!.files![0]);
  }

  const example_file = "Lato-Bold.ttf";

  function loadExample() {
    setRendered([]);
    fetch(example_file)
      .then((resp) => {
        return resp.arrayBuffer();
      })
      .then((buffer) => {
        const uint8Arr = new Uint8Array(buffer);
        worker.postMessage(uint8Arr, [uint8Arr.buffer]);
      });
  }

  let style = styleFunc(
    "memfont://{fontstack}/{range}.pbf",
    fontstackName,
    textSize,
    textField
  );

  let progress = ((rendered.length / 256.0) * 100).toFixed();

  return (
    <main className="sans-serif flex vh-100" id="app">
      <div className="w-25-l w-50 vh-100 pa4 bg-white">
        <h1>Font Maker</h1>
        <div className="bg-light-blue pa2 dim pointer" onClick={loadExample}>
          Load Example {example_file}
        </div>
        <input className="mt3" type="file" onChange={addFont} />
        <div className="progress-bar mt2">
          <span className="progress-bar-fill"></span>
        </div>
        {stackName}
        <div
          v-if="done"
          className="bg-blue mt3 pa2 dim pointer"
          onClick={downloadZip}
        >
          Download
        </div>
        <input type="text" value={textField} onChange={onChangeTextField} />
        <input
          type="range"
          min="8"
          max="48"
          value={textSize}
          onChange={onChangeTextSize}
        />
        <div className="mt4">
          <a href="https://github.com/protomaps/maplibre-font-maker">
            On GitHub
          </a>
        </div>
      </div>
      <div className="w-75-l w-50 overflow-y-scroll white flex flex-column items-center relative">
        <Map
          mapLib={maplibregl}
          RTLTextPlugin="mapbox-gl-rtl-text.min.js"
          mapStyle={style}
          ref={mapRef}
        >
          <NavigationControl />
        </Map>
        {rendered.length < 256 ? (
          <div
            className="w-100 h-100 absolute bg-black flex items-center justify-center"
            style={{ opacity: 0.3, zIndex: 2 }}
          >
            { progress }
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
