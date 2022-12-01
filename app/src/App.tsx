import { useState, useEffect, useRef } from "react";
import "tachyons/css/tachyons.min.css";
import Pbf from "pbf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Map,
  NavigationControl,
  AttributionControl,
  useMap,
} from "react-map-gl";
import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

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
  const { myMap } = useMap();

  let [rendered, setRendered] = useState<RenderedGlyphs[]>([]);
  const renderedRef = useRef(rendered);
  // make the state accessible in protocol hook.
  useEffect(() => { renderedRef.current = rendered });
  let [fontstackName, setFontstackName] = useState<string>("EMPTY");


  useEffect(() => {
    if (rendered.length == 256) {
      let randomString = Math.random().toString(36).slice(2, 7);
      setFontstackName(randomString);
    }
  }, [rendered]);

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
          cancel: () => {}
        }
      }
    );

    return () => {
      worker.onmessage = null;
      maplibregl.removeProtocol("memfont");
    };
  }, []);

  function downloadZip(event: React.MouseEvent<HTMLElement>) {
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

  let style = {
    version: 8,
    glyphs: "memfont://{fontstack}/{range}.pbf",
    sources: {
      demotiles: {
        type: "vector",
        tiles: ["https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf"],
        minzoom: 0,
        maxzoom: 6
      },
    },
    layers: [
      {
        id: "countries",
        type: "fill",
        source: "demotiles",
        "source-layer": "countries",
        paint: {
          "fill-color": "#444",
        }
      },
      {
        id: "countries-label",
        type: "symbol",
        source: "demotiles",
        "source-layer": "centroids",
        layout: {
          "text-font": [fontstackName],
          "text-field": "{NAME}",
        },
        paint: {
          "text-color": "white",
        },
      },
    ],
  } as any;

  return (
    <div className="sans-serif bg-black flex vh-100" id="app">
      <div className="w-25-l w-50 vh-100 bg-light-gray pa4">
        <h1>Font Maker</h1>
        <div className="bg-light-blue pa2 dim pointer" onClick={loadExample}>
          Load Example {example_file}
        </div>
        <input className="mt3" type="file" onChange={addFont} />
        <div className="mt4">Rendered: {rendered.length}</div>
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
        <Map
          mapLib={maplibregl}
          RTLTextPlugin="https://cdn.protomaps.com/mapbox-gl-rtl-text/0.2.3/mapbox-gl-rtl-text.min.js"
          mapStyle={style}
        >
          <NavigationControl />
        </Map>
      </div>
    </div>
  );
}

export default App;
