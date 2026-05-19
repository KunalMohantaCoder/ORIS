"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function objectColor(type) {
  if (type === "debris") return 0xff4d6d;
  if (type === "inactive") return 0xffcc66;
  return 0x5ee7ff;
}

export default function OrbitalEarth({ objects = [], className = "", density = "normal" }) {
  const mountRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    if (!mountRef.current || webglUnavailable) return undefined;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.set(0, 1.45, 5.5);

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
      new THREE.SphereGeometry(1.19, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x5ee7ff,
        transparent: true,
        opacity: 0.08,
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

    const fallback = [
      { id: "fallback-1", type: "active", altitudeKm: 550, inclinationDeg: 53 },
      { id: "fallback-2", type: "debris", altitudeKm: 820, inclinationDeg: 98 },
      { id: "fallback-3", type: "inactive", altitudeKm: 35786, inclinationDeg: 2 }
    ];
    const plotted = (objects.length ? objects : fallback).slice(0, density === "dense" ? 260 : 120);

    plotted.forEach((object, index) => {
      const radius = 1.32 + Math.min(Number(object.altitudeKm || 500), 38000) / 38000 * 1.55;
      const inclination = ((Number(object.inclinationDeg || 0) % 120) * Math.PI) / 180;
      const phase = (index / Math.max(plotted.length, 1)) * Math.PI * 2;
      const material = new THREE.LineBasicMaterial({
        color: objectColor(object.type),
        transparent: true,
        opacity: object.type === "debris" ? 0.28 : 0.2
      });
      const points = Array.from({ length: 128 }, (_, segment) => {
        const angle = (segment / 127) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.985, 0);
      });
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
      orbit.rotation.x = inclination;
      orbit.rotation.z = phase * 0.18;
      orbitGroup.add(orbit);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(object.type === "debris" ? 0.014 : 0.02, 10, 10),
        new THREE.MeshBasicMaterial({ color: objectColor(object.type) })
      );
      marker.position.set(Math.cos(phase) * radius, Math.sin(phase) * radius * 0.985, 0);
      marker.rotation.x = inclination;
      orbitGroup.add(marker);
    });

    function resize() {
      const width = mount.clientWidth;
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const handlePointer = (event) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5
      };
    };

    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", handlePointer);
    let frameId;
    const animate = () => {
      earthGroup.rotation.y += 0.0026;
      orbitGroup.rotation.y += 0.0013 + pointerRef.current.x * 0.0008;
      orbitGroup.rotation.x = 0.12 + pointerRef.current.y * 0.2;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", handlePointer);
      renderer.dispose();
      renderer.forceContextLoss?.();
      earthMaterial.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [objects, density, webglUnavailable]);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={mountRef}>
      {webglUnavailable && <OrbitalEarthFallback objects={objects} density={density} />}
    </div>
  );
}

function OrbitalEarthFallback({ objects = [], density }) {
  const plotted = (objects.length ? objects : [
    { id: "fallback-1", type: "active", altitudeKm: 550 },
    { id: "fallback-2", type: "debris", altitudeKm: 820 },
    { id: "fallback-3", type: "inactive", altitudeKm: 35786 }
  ]).slice(0, density === "dense" ? 42 : 24);

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
          const angle = (index / Math.max(plotted.length, 1)) * Math.PI * 2;
          const shell = 52 + Math.min(Number(object.altitudeKm || 500), 38000) / 38000 * 42;
          const color =
            object.type === "debris" ? "bg-critical" : object.type === "inactive" ? "bg-amber-300" : "bg-cyan-bright";

          return (
            <span
              aria-hidden="true"
              className={`absolute h-1.5 w-1.5 rounded-full ${color} shadow-[0_0_14px_currentColor]`}
              key={`${object.id || object.name}-${index}`}
              style={{
                left: `${50 + Math.cos(angle) * shell}%`,
                top: `${50 + Math.sin(angle) * shell * 0.62}%`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
