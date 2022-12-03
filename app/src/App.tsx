import { useState, useEffect, useRef } from "react";
import "tachyons/css/tachyons.min.css";
import Pbf from "pbf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Map,
  MapRef,
  NavigationControl,
  AttributionControl,
} from "react-map-gl";
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

  async function addFont(event: React.ChangeEvent<HTMLInputElement>) {
    setRendered([]);

    let bufs = [];
    for (let file of event.target.files!) {
      console.log(file);
      bufs.push(await file.arrayBuffer());
    }
    worker.postMessage(bufs);
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
        worker.postMessage([uint8Arr], [uint8Arr.buffer]);
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
      <div className="w-25-l w-50-m w-100 vh-100 pa3 bg-white flex flex-column">
        <div className="flex-grow-1">
          <h1>Font Maker</h1>
          <label for="name" class="f6 b db mb2">
            Load Examples
          </label>
          <div
            className="ba b--black-20 pa2 dim br2 pointer mb3"
            onClick={loadExample}
          >
            {example_file}
          </div>

          <label for="name" class="f6 b db mb2">
            Upload .otf or .ttf files
          </label>
          <input
            className=""
            type="file"
            onChange={addFont}
            multiple={true}
          />
          <div
            className="bg-action fw5 ba b--black-20 pa2 dim mt3 br2 pointer"
            onClick={loadExample}
          >
            Convert
          </div>
          <div className="progress-bar mt">
            <span className="progress-bar-fill"></span>
          </div>

          <div
            className="bg-action mt4 pa2 dim ba b--black-20 br2 pointer mb2 fw5"
            onClick={downloadZip}
          >
            Download {stackName}.zip
          </div>
          <div className="measure">
            <label for="name" class="f6 b db mb2">
              Test Label{" "}
              <span class="normal black-60">default &#123;NAME&#125;</span>
            </label>
            <input
              id="name"
              className="input-reset ba b--black-20 pa2 mb2 db w-100"
              type="text"
              value={textField}
              onChange={onChangeTextField}
            ></input>
          </div>

          <div className="measure">
            <label for="name" class="f6 b db mb2">
              Text Size <span class="normal black-60">{textSize}px</span>
            </label>
            <input
              id="name"
              className="input-reset ba b--black-20 mb2 db w-100"
              type="range"
              min="8"
              max="48"
              value={textSize}
              onChange={onChangeTextSize}
            ></input>
          </div>
        </div>
        <div className="flex-grow-0">
          <a href="https://github.com/protomaps/font-maker" target="_blank">
            <img src="github.svg"></img>
          </a>
        </div>
      </div>
      <div className="w-75-l w-50-m w-0 overflow-y-scroll white flex flex-column items-center relative">
        <Map
          mapLib={maplibregl}
          RTLTextPlugin="mapbox-gl-rtl-text.min.js"
          mapStyle={style}
          ref={mapRef}
        >
          <NavigationControl />
        </Map>
      </div>
    </main>
  );
}

export default App;
