'use client';

import 'ol/ol.css';
import { Map, View } from 'ol';
import { GeoJSON } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { StadiaMaps, Vector } from 'ol/source';
import { Circle, Fill, Stroke, Style } from 'ol/style';

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from 'react';
import type { FeatureLike } from 'ol/Feature';

function style(feature: FeatureLike): Style {
  const image = new Circle({
    radius: 5,
    fill: undefined,
    stroke: new Stroke({ color: 'red', width: 1 }),
  });
  const styles = {
    'Point': new Style({
      image: image,
    }),
    'LineString': new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1,
      }),
    }),
    'MultiLineString': new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1,
      }),
    }),
    'MultiPoint': new Style({
      image: image,
    }),
    'MultiPolygon': new Style({
      stroke: new Stroke({
        color: 'yellow',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
      }),
    }),
    'Polygon': new Style({
      stroke: new Stroke({
        color: 'blue',
        lineDash: [4],
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',
      }),
    }),
    'GeometryCollection': new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 2,
      }),
      fill: new Fill({
        color: 'magenta',
      }),
      image: new Circle({
        radius: 10,
        fill: undefined,
        stroke: new Stroke({
          color: 'magenta',
        }),
      }),
    }),
    'Circle': new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)',
      }),
    }),
    'LinearRing': new Style(),
  };
  return styles[feature.getGeometry()?.getType() ?? "LinearRing"];
}

export default function GeoJSONPage({ params }: Readonly<{ params: { xid: string } }>): ReactElement {

  const mapRef = useRef<HTMLDivElement>(null);
  const [data,] = useState<object>({
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": { "name": "EPSG:3857" }
    },
    "features": [{
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [0, 0] }
    }]
  });


  //TODO: research on how to load remote geojson to the map
  fetch(`/data/geojson/${params.xid}.geojson`).then(async x => x.json()).then(console.debug, console.error);

  useEffect(() => {
    const features = new GeoJSON().readFeatures(data);
    const olMap = new Map({
      view: new View({ zoom: 3, center: [0, 0] }),
      layers: [
        new TileLayer({ source: new StadiaMaps({ layer: "stamen_watercolor" }) }),
        new VectorLayer({ style, source: new Vector({ features }) }),
      ],
    });
    olMap.setTarget(mapRef.current ?? undefined);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center overflow-hidden">
      <div ref={mapRef} className="w-full h-screen" />
    </main>
  );
}
