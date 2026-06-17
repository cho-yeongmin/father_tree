"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadKakaoMapScript, MARKER_IMAGES } from "@/lib/kakao/maps";
import { resolvePinType } from "@/lib/trees/pin-type";
import { formatDistanceKm } from "@/lib/geo/nearby";
import type { Tree } from "@/types/database";
import type { MarkerPinType } from "@/types/tree";
import { TreeSummaryCard } from "./TreeSummaryCard";

interface TreeMapProps {
  trees: Tree[];
  reviewedTreeIds: string[];
  userFocus?: { latitude: number; longitude: number } | null;
  fitAllTrees?: boolean;
}

export function TreeMap({
  trees,
  reviewedTreeIds,
  userFocus = null,
  fitAllTrees = true,
}: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const reviewedSet = useRef(new Set(reviewedTreeIds));

  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [selectedPinType, setSelectedPinType] = useState<MarkerPinType | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const handleMarkerClick = useCallback((tree: Tree, pinType: MarkerPinType) => {
    setSelectedTree(tree);
    setSelectedPinType(pinType);
  }, []);

  useEffect(() => {
    reviewedSet.current = new Set(reviewedTreeIds);
  }, [reviewedTreeIds]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapRef.current) return;

      try {
        await loadKakaoMapScript();
        if (cancelled || !mapRef.current) return;

        const center = new kakao.maps.LatLng(36.5, 127.5);
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level: 13,
        });
        mapInstanceRef.current = map;

        const clusterer = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 8,
          gridSize: 60,
        });
        clustererRef.current = clusterer;

        setIsLoading(false);
        setMapReady(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "지도를 불러올 수 없습니다.",
        );
        setIsLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      clustererRef.current?.clear();
      markersRef.current = [];
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterer = clustererRef.current;
    if (!mapReady || !map || !clusterer || trees.length === 0) return;

    clusterer.clear();
    markersRef.current = [];

    const markers = trees.map((tree) => {
      const pinType = resolvePinType(tree, reviewedSet.current);
      const imageConfig = MARKER_IMAGES[pinType];
      const position = new kakao.maps.LatLng(tree.latitude, tree.longitude);

      const markerImage = new kakao.maps.MarkerImage(
        imageConfig.src,
        new kakao.maps.Size(imageConfig.width, imageConfig.height),
        {
          offset: new kakao.maps.Point(
            imageConfig.width / 2,
            imageConfig.height,
          ),
        },
      );

      const marker = new kakao.maps.Marker({
        position,
        image: markerImage,
        title: tree.name,
        clickable: true,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        handleMarkerClick(tree, pinType);
        map.panTo(position);
      });

      return marker;
    });

    markersRef.current = markers;
    clusterer.addMarkers(markers);

    if (userFocus) {
      const userLatLng = new kakao.maps.LatLng(
        userFocus.latitude,
        userFocus.longitude,
      );
      map.setCenter(userLatLng);
      map.setLevel(trees.length <= 3 ? 4 : 6);
    } else if (fitAllTrees && trees.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      trees.forEach((tree) => {
        bounds.extend(new kakao.maps.LatLng(tree.latitude, tree.longitude));
      });
      map.setBounds(bounds, 80, 80, 80, 80);
    }
  }, [trees, handleMarkerClick, mapReady, userFocus, fitAllTrees]);

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-border/30 p-6 text-center">
        <div>
          <p className="text-xl font-medium text-foreground">지도를 불러올 수 없습니다</p>
          <p className="mt-2 text-lg text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-[50vh]">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
          <p className="text-lg text-muted">지도를 불러오는 중...</p>
        </div>
      )}
      <div ref={mapRef} className="h-full min-h-[50vh] w-full" />
      {selectedTree && selectedPinType && (
        <TreeSummaryCard
          tree={selectedTree}
          pinType={selectedPinType}
          distanceLabel={
            userFocus
              ? formatDistanceKm(
                  userFocus.latitude,
                  userFocus.longitude,
                  selectedTree,
                )
              : null
          }
          onClose={() => {
            setSelectedTree(null);
            setSelectedPinType(null);
          }}
        />
      )}
    </div>
  );
}
