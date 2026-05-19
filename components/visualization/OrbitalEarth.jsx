"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Target, ZoomIn } from "lucide-react";
import * as THREE from "three";

const TYPE_META = {
  active: { color: 0x5ee7ff, label: "Active", chip: "bg-cyan-signal" },
  inactive: { color: 0xffcc66, label: "Inactive", chip: "bg-warning" },
  debris: { color: 0xff4d6d, label: "Debris", chip: "bg-critical" }
};

function objectColor(type) {
  return TYPE_META[type]?.color || TYPE_META.active.color;
}

function fallbackObjects() {
  return [
    { id: "fallback-1", name: "Reference satellite", type: "active", altitudeKm: 550, inclinationDeg: 53, regime: "LEO" },
    { id: "fallback-2", name: "Debris fragment", type: "debris", altitudeKm: 820, inclinationDeg: 98, regime: "LEO" },
    { id: "fallback-3", name: "Inactive GEO bus", type: "inactive", altitudeKm: 35786, inclinationDeg: 2, regime: "GEO" }
  ];
}

function objectLimit(density) {
  return density === "dense" ? 280 : 130;
}

export default function OrbitalEarth({
  objects = [],
  className = "",
  density = "normal",
  controls = true
}) {
  const mountRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.12, y: 0 });
  const zoomRef = useRef(5.5);
  const pausedRef = useRef(false);
  const visibleTypesRef = useRef({ active: true, inactive: true, debris: true });
  const hoveredObjectRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState({ active: true, inactive: true, debris: true });
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const plottedObjects = useMemo(
    () => (objects.length ? objects : fallbackObjects()).slice(0, objectLimit(density)),
    [objects, density]
  );
  const visibleCount = plottedObjects.filter((object) => visibleTypes[object.type] !== false).length;
  const selected = selectedObject || hoveredObject;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    visibleTypesRef.current = visibleTypes;
  }, [visibleTypes]);

  useEffect(() => {
    hoveredObjectRef.current = hoveredObject;
  }, [hoveredObject]);

  useEffect(() => {
    selectedObjectRef.current = selectedObject;
  }, [selectedObject]);

  useEffect(() => {
    if (!mountRef.current || webglUnavailable) return undefined;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.set(0, 1.45, zoomRef.current);

    let renderer;
    try {
      const probe = document.createElement("canvas");
      const context =
        probe.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
        probe.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
        probe.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: false });

      if (!context) {
        setWebglUnavailable(true);
        return undefined;
      }

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    } catch {
      setWebglUnavailable(true);
      return undefined;
    }

    renderer.domElement.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        setWebglUnavailable(true);
      },
      { once: true }
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    const orbitGroup = new THREE.Group();
    scene.add(earthGroup);
    scene.add(orbitGroup);

    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b3c73,
      emissive: 0x06182d,
      roughness: 0.55,
      metalness: 0.18
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.16, 64, 64), earthMaterial);
    earthGroup.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.21, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x5ee7ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      })
    );
    earthGroup.add(atmosphere);

    const meridianMaterial = new THREE.LineBasicMaterial({ color: 0x87f6ff, transparent: true, opacity: 0.16 });
    for (let i = 0; i < 9; i += 1) {
      const ring = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 145 }, (_, index) => {
            const angle = (index / 144) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * 1.165, Math.sin(angle) * 1.165, 0);
          })
        ),
        meridianMaterial
      );
      ring.rotation.y = (Math.PI / 9) * i;
      earthGroup.add(ring);
    }

    const light = new THREE.DirectionalLight(0xffffff, 2.4);
    light.position.set(3, 4, 4);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x4db6d6, 0.65));

    const selectableMarkers = [];
    plottedObjects.forEach((object, index) => {
      const radius = 1.32 + (Math.min(Number(object.altitudeKm || 500), 38000) / 38000) * 1.55;
      const inclination = ((Number(object.inclinationDeg || 0) % 120) * Math.PI) / 180;
      const phase = (index / Math.max(plottedObjects.length, 1)) * Math.PI * 2;
      const objectNode = new THREE.Group();
      objectNode.rotation.x = inclination;
      objectNode.rotation.z = phase * 0.18;
      objectNode.userData = { object, type: object.type };

      const orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 128 }, (_, segment) => {
            const angle = (segment / 127) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.985, 0);
          })
        ),
        new THREE.LineBasicMaterial({
          color: objectColor(object.type),
          transparent: true,
          opacity: object.type === "debris" ? 0.32 : 0.22
        })
      );
      orbit.userData = { type: object.type };
      objectNode.add(orbit);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(object.type === "debris" ? 0.022 : 0.03, 12, 12),
        new THREE.MeshBasicMaterial({ color: objectColor(object.type) })
      );
      marker.position.set(Math.cos(phase) * radius, Math.sin(phase) * radius * 0.985, 0);
      marker.userData = { object, type: object.type, baseScale: object.type === "debris" ? 0.8 : 1 };
      objectNode.add(marker);
      selectableMarkers.push(marker);
      orbitGroup.add(objectNode);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function resize() {
      const width = mount.clientWidth;
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function updatePointer(event) {
      const rect = mount.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5
      };
      pointer.x = pointerRef.current.x * 2;
      pointer.y = pointerRef.current.y * -2;
    }

    const handlePointerDown = (event) => {
      dragRef.current = { active: true, x: event.clientX, y: event.clientY };
      mount.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      updatePointer(event);
      if (dragRef.current.active) {
        const dx = event.clientX - dragRef.current.x;
        const dy = event.clientY - dragRef.current.y;
        rotationRef.current.y += dx * 0.006;
        rotationRef.current.x = Math.max(-0.9, Math.min(0.9, rotationRef.current.x + dy * 0.004));
        dragRef.current = { active: true, x: event.clientX, y: event.clientY };
      }

      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(selectableMarkers.filter((marker) => marker.visible), false);
      const nextHovered = hit?.object?.userData?.object || null;
      if ((hoveredObjectRef.current?.id || null) !== (nextHovered?.id || null)) {
        hoveredObjectRef.current = nextHovered;
        setHoveredObject(nextHovered);
      }
      mount.style.cursor = hit ? "pointer" : dragRef.current.active ? "grabbing" : "grab";
    };

    const handlePointerUp = (event) => {
      dragRef.current.active = false;
      mount.releasePointerCapture?.(event.pointerId);
      mount.style.cursor = hoveredObjectRef.current ? "pointer" : "grab";
    };

    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(selectableMarkers.filter((marker) => marker.visible), false);
      if (hit?.object?.userData?.object) {
        setSelectedObject(hit.object.userData.object);
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      zoomRef.current = Math.max(3.4, Math.min(7.4, zoomRef.current + event.deltaY * 0.003));
    };

    window.addEventListener("resize", resize);
    mount.addEventListener("pointerdown", handlePointerDown);
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerup", handlePointerUp);
    mount.addEventListener("pointerleave", handlePointerUp);
    mount.addEventListener("click", handleClick);
    mount.addEventListener("wheel", handleWheel, { passive: false });

    let frameId;
    const animate = () => {
      const targetZoom = zoomRef.current;
      camera.position.z += (targetZoom - camera.position.z) * 0.08;
      earthGroup.rotation.y += pausedRef.current ? 0 : 0.0024;
      orbitGroup.rotation.y += pausedRef.current ? 0 : 0.0011;
      orbitGroup.rotation.y += (rotationRef.current.y - orbitGroup.rotation.y) * 0.055;
      orbitGroup.rotation.x += (rotationRef.current.x - orbitGroup.rotation.x) * 0.08;

      selectableMarkers.forEach((marker) => {
        const visible = visibleTypesRef.current[marker.userData.type] !== false;
        marker.visible = visible;
        marker.parent.visible = visible;
        const isSelected = selectedObjectRef.current?.id === marker.userData.object?.id;
        const isHovered = hoveredObjectRef.current?.id === marker.userData.object?.id;
        const scale = isSelected ? 2.15 : isHovered ? 1.65 : 1;
        marker.scale.setScalar(scale * marker.userData.baseScale);
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointerdown", handlePointerDown);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerup", handlePointerUp);
      mount.removeEventListener("pointerleave", handlePointerUp);
      mount.removeEventListener("click", handleClick);
      mount.removeEventListener("wheel", handleWheel);
      mount.style.cursor = "";
      scene.traverse((node) => {
        node.geometry?.dispose?.();
        node.material?.dispose?.();
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [plottedObjects, webglUnavailable]);

  function toggleType(type) {
    setVisibleTypes((current) => ({ ...current, [type]: !current[type] }));
  }

  function resetView() {
    rotationRef.current = { x: 0.12, y: 0 };
    zoomRef.current = 5.5;
    setSelectedObject(null);
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={mountRef}>
      {webglUnavailable && (
        <OrbitalEarthFallback
          density={density}
          objects={plottedObjects}
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          visibleTypes={visibleTypes}
        />
      )}

      {controls && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 grid gap-3 md:bottom-4 md:grid-cols-[1fr_auto]">
          <div
            className="pointer-events-auto rounded-md border border-cyan-signal/15 bg-void/75 p-3 backdrop-blur-md"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <button
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                    visibleTypes[type]
                      ? "border-cyan-signal/30 bg-cyan-signal/10 text-cyan-bright"
                      : "border-white/10 bg-white/[0.03] text-slate-500"
                  }`}
                  key={type}
                  onClick={() => toggleType(type)}
                  type="button"
                >
                  <span className={`h-2 w-2 rounded-full ${meta.chip}`} />
                  {meta.label}
                </button>
              ))}
              <button
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-signal/30 hover:text-cyan-bright"
                onClick={() => setPaused((current) => !current)}
                type="button"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-signal/30 hover:text-cyan-bright"
                onClick={resetView}
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              <span>{visibleCount} objects plotted</span>
              <span className="inline-flex items-center gap-1">
                <Target className="h-3 w-3" /> Drag globe
              </span>
              <span className="inline-flex items-center gap-1">
                <ZoomIn className="h-3 w-3" /> Wheel zoom
              </span>
            </div>
          </div>

          <div
            className="pointer-events-auto min-w-[220px] rounded-md border border-cyan-signal/15 bg-void/78 p-3 backdrop-blur-md"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-bright">
              {selected ? "Object lock" : "No object selected"}
            </p>
            {selected ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="truncate font-semibold text-white">{selected.name || selected.objectName || selected.id}</p>
                <p className="font-mono text-xs text-slate-400">
                  {selected.type || "object"} / {selected.regime || "orbit"} / {Math.round(selected.altitudeKm || 0)} km
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-slate-400">Hover or click a marker to inspect its orbital layer.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrbitalEarthFallback({ objects = [], density, selectedObject, setSelectedObject, visibleTypes }) {
  const plotted = (objects.length ? objects : fallbackObjects()).slice(0, density === "dense" ? 48 : 28);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(13,60,115,0.48),rgba(5,9,20,0.1)_48%,transparent_72%)]">
      <div className="relative aspect-square w-[min(78%,580px)] rounded-full border border-cyan-signal/35 bg-[radial-gradient(circle_at_35%_30%,rgba(135,246,255,0.34),rgba(11,60,115,0.58)_34%,rgba(5,9,20,0.76)_68%)] shadow-[0_0_90px_rgba(94,231,255,0.18)]">
        {[1.24, 1.54, 1.88].map((scale, index) => (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 rounded-full border border-cyan-signal/20"
            key={scale}
            style={{
              animation: `oris-spin ${28 + index * 12}s linear infinite`,
              height: `${scale * 100}%`,
              transform: `translate(-50%, -50%) rotate(${index * 26}deg)`,
              width: `${scale * 100}%`
            }}
          />
        ))}
        {plotted.map((object, index) => {
          if (visibleTypes[object.type] === false) return null;
          const angle = (index / Math.max(plotted.length, 1)) * Math.PI * 2;
          const shell = 52 + (Math.min(Number(object.altitudeKm || 500), 38000) / 38000) * 42;
          const color = TYPE_META[object.type]?.chip || TYPE_META.active.chip;
          const selected = selectedObject?.id === object.id;

          return (
            <button
              aria-label={`Inspect ${object.name || object.id}`}
              className={`absolute rounded-full ${color} shadow-[0_0_14px_currentColor] transition ${
                selected ? "h-3 w-3 ring-2 ring-white/70" : "h-1.5 w-1.5 hover:h-2.5 hover:w-2.5"
              }`}
              key={`${object.id || object.name}-${index}`}
              onClick={() => setSelectedObject(object)}
              style={{
                left: `${50 + Math.cos(angle) * shell}%`,
                top: `${50 + Math.sin(angle) * shell * 0.62}%`
              }}
              type="button"
            />
          );
        })}
      </div>
    </div>
  );
}
