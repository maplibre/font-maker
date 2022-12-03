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

const EXAMPLES = ["Barlow-Regular.ttf","Lato-Bold.ttf"];

function App() {
  let [rendered, setRendered] = useState<RenderedGlyphs[]>([]);
  let [textField, setTextField] = useState<string>("{NAME}");
  let [textSize, setTextSize] = useState<number>(16);
  let [stackName, setStackName] = useState<string>("");
  let [fileUploads, setFileUploads] = useState<File[]>([]);
  let [inProgress, setInProgress] = useState<bool>(false);

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
    if (rendered.length === 256) {
      setInProgress(false);
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
    if (rendered.length === 0) return;
    var zip = new JSZip();
    var folder = zip.folder(stackName)!;
    for (var i of rendered) {
      folder.file(i.name, i.buffer);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, stackName + ".zip");
    });
  }

  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    setRendered([]);
    setFileUploads([...fileUploads, ...event.target.files!]);
  }

  async function runFilesConvert() {
    if (fileUploads.length === 0) return;
    let bufs: ArrayBuffer[] = [];
    for (let file of fileUploads) {
      bufs.push(await file.arrayBuffer());
    }
    worker.postMessage(bufs, bufs);
    setInProgress(true);
  }


  function loadExample(example: string) {
    setFileUploads([]);
    setRendered([]);
    fetch(example)
      .then((resp) => {
        return resp.arrayBuffer();
      })
      .then((buffer) => {
        worker.postMessage([buffer], [buffer]);
        setInProgress(true);
      });
  }

  let style = styleFunc(
    "memfont://{fontstack}/{range}.pbf",
    fontstackName,
    textSize,
    textField
  );

  return (
    <main className="sans-serif flex vh-100" id="app">
      <div className="w-25-l w-50-m w-100 vh-100 pa3 bg-white flex flex-column">
        <div className="flex-grow-1">
          <h1>Font Maker</h1>
          <label className="f6 b db mb2">Load Examples</label>

          {EXAMPLES.map(function (example, i) {
            return (
              <div
                className="ba b--black-20 pa2 dim br2 pointer mb1 f6"
                onClick={() => {
                  loadExample(example);
                }}
                key={i}
              >
                {example}
              </div>
            );
          })}

          <label htmlFor="addFonts" className="f6 b db mb2 mt3">
            Upload .otf or .ttf files
          </label>
          <input
            id="addFonts"
            type="file"
            accept=".otf,.ttf"
            onChange={addFiles}
            multiple={true}
          />

          {fileUploads.map(function (fileUpload, i) {
            return <div className="mt2 f6" key={i}>{fileUpload.name}</div>;
          })}

          <div
            className={"pa2 mt3 br2 " + (fileUploads.length > 0 ? "dim bg-action pointer" : "bg-light-gray gray") } 
            onClick={runFilesConvert}
          >
            Convert
          </div>

          { inProgress ? 
          <div className="flex items-center mt3">
            <div className="loadingspinner mr3"></div>
            <div className="f6">{rendered.length} / 256 files...</div>
          </div> : null }

          <div
            className={"mt4 pa2 br2 mb3 " + (rendered.length > 0 ? "bg-action dim pointer" : "bg-light-gray gray")}
            onClick={downloadZip}
          >
            Download {stackName}.zip
          </div>
          <div className="measure">
            <label htmlFor="testLabel" className="f6 b db mb2">
              Test Label{" "}
              <span className="normal black-60">default &#123;NAME&#125;</span>
            </label>
            <input
              id="testLabel"
              className="input-reset ba b--black-20 pa2 mb2 db w-100"
              type="text"
              value={textField}
              onChange={onChangeTextField}
            ></input>
          </div>

          <div className="measure">
            <label htmlFor="textSize" className="f6 b db mb2">
              Text Size <span className="normal black-60">{textSize}px</span>
            </label>
            <input
              id="textSize"
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
