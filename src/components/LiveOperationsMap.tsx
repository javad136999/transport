"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type LiveMissionPoint = {
  id: string;
  missionNo: string;
  plate: string;
  status: string;
  risk: "low" | "medium" | "high";
  latitude: number;
  longitude: number;
  recordedAt: string;
};

const RISK_LABEL: Record<string, string> = {
  low: "پایین",
  medium: "متوسط",
  high: "بالا",
};

const STATUS_LABEL: Record<string, string> = {
  in_transit: "در حال حمل",
  arrived_destination: "رسیده به مقصد",
  unloading_started: "تخلیه در حال انجام",
};

export function LiveOperationsMap({ points }: { points: LiveMissionPoint[] }) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapNode.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [52.60, 27.48],
      zoom: 10.7,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-left");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      const old = document.querySelectorAll(".live-tanker-marker");
      old.forEach((node) => node.remove());

      if (!points.length) return;

      const bounds = new maplibregl.LngLatBounds();

      points.forEach((point) => {
        const markerEl = document.createElement("button");
        markerEl.type = "button";
        markerEl.className = "live-tanker-marker";
        markerEl.setAttribute("aria-label", `تانکر ${point.plate}`);
        markerEl.innerHTML = `<span class="live-tanker-pulse"></span><span class="live-tanker-icon">▰</span>`;

        const riskClass = point.risk === "high" ? "risk-high" : point.risk === "medium" ? "risk-medium" : "risk-low";
        const popup = new maplibregl.Popup({ offset: 22, closeButton: true, maxWidth: "280px" }).setHTML(`
          <div dir="rtl" class="live-popup">
            <div class="live-popup-title">${point.missionNo}</div>
            <div class="live-popup-row"><span>پلاک</span><b dir="ltr">${point.plate}</b></div>
            <div class="live-popup-row"><span>وضعیت</span><b>${STATUS_LABEL[point.status] ?? point.status}</b></div>
            <div class="live-popup-row"><span>ریسک</span><b class="${riskClass}">${RISK_LABEL[point.risk]}</b></div>
            <div class="live-popup-time">آخرین GPS: ${new Date(point.recordedAt).toLocaleTimeString("fa-IR")}</div>
          </div>
        `);

        new maplibregl.Marker({ element: markerEl, anchor: "center" })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);

        bounds.extend([point.longitude, point.latitude]);
      });

      if (points.length > 1) {
        map.fitBounds(bounds, { padding: 90, maxZoom: 13, duration: 600 });
      } else if (points.length === 1) {
        map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom: 12.5, duration: 600 });
      }
    };

    if (map.isStyleLoaded()) renderMarkers();
    else map.once("load", renderMarkers);
  }, [points]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071a20] shadow-[0_0_40px_rgba(0,194,209,0.08)]">
      <div ref={mapNode} className="h-[520px] w-full md:h-[620px]" />
      <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-[#06141ad9] px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2 font-bold"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> رصد زنده ناوگان</div>
        <div className="space-y-1 text-white/65">
          <div>تانکرهای روی نقشه: <b className="text-white">{points.length.toLocaleString("fa-IR")}</b></div>
          <div>آخرین بروزرسانی با بارگذاری صفحه</div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 left-4 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full border border-emerald-300/20 bg-[#06141ae6] px-3 py-1.5 text-emerald-200">● ریسک پایین</span>
        <span className="rounded-full border border-amber-300/20 bg-[#06141ae6] px-3 py-1.5 text-amber-200">● ریسک متوسط</span>
        <span className="rounded-full border border-rose-300/20 bg-[#06141ae6] px-3 py-1.5 text-rose-200">● ریسک بالا</span>
      </div>
    </div>
  );
}
