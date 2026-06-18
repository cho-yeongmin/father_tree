"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadKakaoMapScript, MARKER_IMAGES } from "@/lib/kakao/maps";
import {
  loadMapViewport,
  saveMapViewport,
} from "@/lib/map/viewport-storage";
import { attachLabelImage } from "@/lib/map/label-image-loader";
import type { GeoBounds } from "@/lib/geo/bounds";
import { resolvePinType } from "@/lib/trees/pin-type";
import { formatDistanceKm } from "@/lib/geo/nearby";
import type { Tree } from "@/types/database";
import type { MarkerPinType } from "@/types/tree";
import {
  createTreeMarkerLabelElement,
  shouldShowTreeMarkerLabels,
} from "./tree-marker-label";
import { TreeSummaryCard } from "./TreeSummaryCard";

interface TreeMapProps {
  trees: Tree[];
  reviewedTreeIds: string[];
  userFocus?: { latitude: number; longitude: number } | null;
  fitAllTrees?: boolean;
  onMapViewportChange?: (bounds: GeoBounds, mapLevel: number) => void;
  protectedLoading?: boolean;
}

interface OverlayItem {
  tree: Tree;
  overlay: kakao.maps.CustomOverlay;
  thumbImg: HTMLImageElement | null;
  position: kakao.maps.LatLng;
}

export function TreeMap({
  trees,
  reviewedTreeIds,
  userFocus = null,
  fitAllTrees = false,
  onMapViewportChange,
  protectedLoading = false,
}: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlayItemsRef = useRef<OverlayItem[]>([]);
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

  const emitViewportChange = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      return;
    }

    const center = map.getCenter();
    saveMapViewport({
      latitude: center.getLat(),
      longitude: center.getLng(),
      level: map.getLevel(),
    });

    if (!onMapViewportChange) {
      return;
    }

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    onMapViewportChange(
      {
        south: sw.getLat(),
        west: sw.getLng(),
        north: ne.getLat(),
        east: ne.getLng(),
      },
      map.getLevel(),
    );
  }, [onMapViewportChange]);

  const refreshOverlayVisibility = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    overlayItemsRef.current.forEach((item) => {
      const inBounds = bounds.contain(item.position);
      const show =
        inBounds && shouldShowTreeMarkerLabels(map.getLevel());

      if (show) {
        item.overlay.setMap(map);
        if (item.thumbImg) {
          attachLabelImage(item.thumbImg);
        }
      } else {
        item.overlay.setMap(null);
      }
    });
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

        const initialViewport = loadMapViewport();
        const center = new kakao.maps.LatLng(
          initialViewport.latitude,
          initialViewport.longitude,
        );
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level: initialViewport.level,
        });
        mapInstanceRef.current = map;

        const clusterer = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 8,
          gridSize: 60,
        });
        clustererRef.current = clusterer;

        kakao.maps.event.addListener(map, "zoom_changed", refreshOverlayVisibility);
        kakao.maps.event.addListener(map, "dragend", refreshOverlayVisibility);
        kakao.maps.event.addListener(map, "idle", () => {
          refreshOverlayVisibility();
          emitViewportChange();
        });

        setIsLoading(false);
        setMapReady(true);
        refreshOverlayVisibility();
        emitViewportChange();
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
      overlayItemsRef.current.forEach((item) => item.overlay.setMap(null));
      overlayItemsRef.current = [];
      setMapReady(false);
    };
  }, [refreshOverlayVisibility, emitViewportChange]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterer = clustererRef.current;
    if (!mapReady || !map || !clusterer) return;

    clusterer.clear();
    markersRef.current = [];
    overlayItemsRef.current.forEach((item) => item.overlay.setMap(null));
    overlayItemsRef.current = [];

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

      const openSummary = () => {
        handleMarkerClick(tree, pinType);
        map.panTo(position);
      };

      kakao.maps.event.addListener(marker, "click", openSummary);

      const labelElement = createTreeMarkerLabelElement(tree, openSummary);
      const thumbImg = labelElement.querySelector("img");
      const thumbElement =
        thumbImg instanceof HTMLImageElement ? thumbImg : null;

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: labelElement,
        xAnchor: 0,
        yAnchor: 1,
        zIndex: 4,
      });

      overlayItemsRef.current.push({
        tree,
        overlay,
        thumbImg: thumbElement,
        position,
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

    refreshOverlayVisibility();
  }, [
    trees,
    handleMarkerClick,
    mapReady,
    userFocus,
    fitAllTrees,
    refreshOverlayVisibility,
  ]);

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
      {protectedLoading && (
        <div className="absolute right-3 top-3 z-20 rounded-lg bg-card/95 px-3 py-2 text-sm text-muted shadow-md">
          보호수 불러오는 중…
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
