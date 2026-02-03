"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type { InsightEvent } from "@/lib/types";

type Props = {
  events: InsightEvent[];
  selectedId?: string | null;
  onSelect: (event: InsightEvent) => void;
};

export const InsightMap = ({ events, selectedId, onSelect }: Props) => {
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-3xl border border-slate-800">
      <Map
        mapLib={maplibregl as any}
        initialViewState={{ latitude: 39.8283, longitude: -98.5795, zoom: 3.6 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            latitude={event.location.lat}
            longitude={event.location.lng}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(event);
            }}
          >
            <div
              className={`h-3 w-3 rounded-full border ${
                selectedId === event.id
                  ? "border-white bg-amber-300"
                  : event.severity === "High"
                    ? "border-rose-200 bg-rose-500"
                    : event.severity === "Medium"
                      ? "border-amber-200 bg-amber-400"
                      : "border-emerald-200 bg-emerald-400"
              }`}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
};
