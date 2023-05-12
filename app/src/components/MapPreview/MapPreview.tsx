import React from 'react';
import { Map, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import { useMapLibreStyleSpec } from './useMapLibreStyleSpec.js';
import { MapConfig } from '../../types/types.js';

import 'maplibre-gl/dist/maplibre-gl.css';


interface Props {
    mapConfig: MapConfig;
}

export function MapPreview({ mapConfig }: Props) {
    const mapStyle = useMapLibreStyleSpec(mapConfig);
    return (
        <Map
            mapLib={maplibregl}
            RTLTextPlugin='https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js'
            mapStyle={mapStyle as any}
        >
            <NavigationControl />
        </Map>
    );
}
