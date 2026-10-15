'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface KageCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
}

export function KageCanvas({ scrollProgress }: KageCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Fog Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);
    scene.fog = new THREE.FogExp2(0x06080d, 0.010);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      280
    );
    camera.position.set(0, 3.2, 28);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2234, 1.1);
    scene.add(ambientLight);

    // Moonlight (cool blue)
    const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
    moonLight.position.set(20, 45, -20);
    scene.add(moonLight);

    // Vermilion moon back-glow
    const vermilionGlow = new THREE.PointLight(0xef4444, 4.0, 110);
    vermilionGlow.position.set(2, 32, -75);
    scene.add(vermilionGlow);

    // 5. Materials
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.85,
      metalness: 0.1,
    });

    const vermilionMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.45,
      metalness: 0.15,
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.95,
      metalness: 0.05,
    });

    // Translucent glowing shoji material (see-through paper with inner light)
    const glowingShojiMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      transparent: true,
      opacity: 0.72,
    });

    // 6. Terrain & Ground
    const groundGeo = new THREE.PlaneGeometry(160, 220, 32, 32);
    // Add subtle procedural mountain elevation to ground vertices
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const distFromCenter = Math.abs(vx);
      if (distFromCenter > 6) {
        pos.setZ(i, Math.sin(vy * 0.1) * 1.5 + (distFromCenter - 6) * 0.35);
      }
    }
    groundGeo.computeVertexNormals();

    const ground = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({
        color: 0x0a0c12,
        roughness: 0.95,
        wireframe: false,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Central Stone Pathway Stairs
    const pathGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const z = 22 - i * 1.8;
      const y = i * 0.22;
      const step = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 1.4), stoneMat);
      step.position.set(0, y, z);
      pathGroup.add(step);
    }
    scene.add(pathGroup);

    // 7. Large Vermilion Moon
    const moonGeo = new THREE.SphereGeometry(14, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(2, 32, -80);
    scene.add(moon);

    // Moon halo ring
    const haloGeo = new THREE.RingGeometry(14.5, 20, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(2, 32, -79.8);
    scene.add(halo);

    // 8. Torii Gate (At Entrance)
    const toriiGroup = new THREE.Group();
    toriiGroup.position.set(0, 0, 14);

    // Upright pillars
    const pillarGeo = new THREE.CylinderGeometry(0.32, 0.38, 8, 16);
    const leftPillar = new THREE.Mesh(pillarGeo, vermilionMat);
    leftPillar.position.set(-2.8, 3.8, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, vermilionMat);
    rightPillar.position.set(2.8, 3.8, 0);
    toriiGroup.add(leftPillar, rightPillar);

    // Top lintels (Kasagi and Shimaki)
    const topBarGeo = new THREE.BoxGeometry(8.2, 0.55, 0.7);
    const topBar = new THREE.Mesh(topBarGeo, vermilionMat);
    topBar.position.set(0, 7.8, 0);

    const blackCapGeo = new THREE.BoxGeometry(8.6, 0.2, 0.85);
    const blackCap = new THREE.Mesh(blackCapGeo, darkWoodMat);
    blackCap.position.set(0, 8.1, 0);

    const midBarGeo = new THREE.BoxGeometry(7.2, 0.35, 0.45);
    const midBar = new THREE.Mesh(midBarGeo, vermilionMat);
    midBar.position.set(0, 6.4, 0);

    toriiGroup.add(topBar, blackCap, midBar);
    scene.add(toriiGroup);

    // 9. Stone Lanterns (Tōrō) along path
    const lanternLights: THREE.PointLight[] = [];
    const createLantern = (x: number, y: number, z: number) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);

      // Base pedestal
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), stoneMat);
      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 1.4, 8), stoneMat);
      shaft.position.y = 0.8;
      // Light box
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), glowingShojiMat);
      box.position.y = 1.7;
      // Roof cap
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.4, 4), stoneMat);
      roof.position.y = 2.2;
      roof.rotation.y = Math.PI / 4;

      g.add(base, shaft, box, roof);

      // Warm amber point light
      const light = new THREE.PointLight(0xf59e0b, 1.2, 8);
      light.position.y = 1.7;
      g.add(light);
      lanternLights.push(light);

      return g;
    };

    for (let i = 0; i < 8; i++) {
      const z = 18 - i * 5;
      const y = i * 0.6;
      scene.add(createLantern(-3.2, y, z));
      scene.add(createLantern(3.2, y, z));
    }

    // 10. Temple Pavilion (Hondō) in mid-ground
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0, 6.5, -28);

    // Foundation
    const tBase = new THREE.Mesh(new THREE.BoxGeometry(16, 1.5, 12), stoneMat);
    templeGroup.add(tBase);

    // Glowing shoji walls (translucent see-through paper)
    const shojiWalls = new THREE.Mesh(new THREE.BoxGeometry(13.5, 4.5, 9.5), glowingShojiMat);
    shojiWalls.position.y = 3;
    templeGroup.add(shojiWalls);

    // Warm golden light inside the temple pavilion (shines outward through translucent shoji)
    const templeInteriorLight = new THREE.PointLight(0xf59e0b, 3.8, 30);
    templeInteriorLight.position.set(0, 3.5, 0);
    templeGroup.add(templeInteriorLight);

    // Inner sacred sanctuary core (visible through see-through shoji walls)
    const innerSanctuary = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 3.2, 3.5),
      new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.35,
        metalness: 0.2,
      })
    );
    innerSanctuary.position.set(0, 2.5, 0);
    templeGroup.add(innerSanctuary);

    // Wooden pillars
    for (let px of [-7, -3.5, 0, 3.5, 7]) {
      for (let pz of [-5, 5]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5, 8), darkWoodMat);
        pillar.position.set(px, 3, pz);
        templeGroup.add(pillar);
      }
    }

    // Traditional Pagoda Eaves (Hipped curved roof)
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(13, 2.5, 4), darkWoodMat);
    roof1.position.y = 6.2;
    roof1.rotation.y = Math.PI / 4;
    roof1.scale.set(1.4, 1, 1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(9.5, 2.2, 4), darkWoodMat);
    roof2.position.y = 8.6;
    roof2.rotation.y = Math.PI / 4;
    roof2.scale.set(1.3, 1, 1);

    templeGroup.add(roof1, roof2);
    scene.add(templeGroup);

    // 11. Floating Golden Embers / Fireflies
    const emberCount = 350;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeed = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 40;
      emberPositions[i * 3 + 1] = Math.random() * 18;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      emberSpeed[i] = 0.015 + Math.random() * 0.025;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 12. Falling Night Rain / Mist particles
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 50;
      rainPositions[i * 3 + 1] = Math.random() * 30;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.35,
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    scene.add(rain);

    // 13. Camera Spline Waypoints
    // Continuously keeps the illuminated mountain temple framed in view at all times
    const cameraWaypoints = [
      // Ch 1: Entrance / Threshold (Torii gate, lantern avenue, glowing temple in background)
      { pos: new THREE.Vector3(0, 3.2, 28), target: new THREE.Vector3(0, 6.2, -26) },
      // Ch 2: Ascending between lanterns (Approaching temple courtyard)
      { pos: new THREE.Vector3(2.2, 5.0, 14), target: new THREE.Vector3(0, 6.8, -26) },
      // Ch 3: Temple Courtyard (Right before glowing translucent shoji & red moon)
      { pos: new THREE.Vector3(-2.8, 6.5, -4), target: new THREE.Vector3(0, 7.8, -27) },
      // Ch 4: Close Sanctuary Angle (Admiring the sacred craft and architectural discipline)
      { pos: new THREE.Vector3(3.2, 8.5, -12), target: new THREE.Vector3(0, 7.2, -28) },
      // Ch 5: Panoramic Summit (Elevated view over temple eaves, lanterns, and valley mist)
      { pos: new THREE.Vector3(0, 12.5, -8), target: new THREE.Vector3(0, 6.8, -28) },
    ];

    // Mouse movement listener for subtle cinematic parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize listener
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 14. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const currentPos = new THREE.Vector3();
    const currentTarget = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip GPU render when tab is backgrounded
      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Animate floating embers
      const emberPosAttr = emberGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        let y = emberPosAttr.getY(i) + emberSpeed[i];
        if (y > 22) y = 0;
        emberPosAttr.setY(i, y);
        // Subtle drift with sine wave
        const x = emberPosAttr.getX(i) + Math.sin(elapsedTime * 1.5 + i) * 0.005;
        emberPosAttr.setX(i, x);
      }
      emberPosAttr.needsUpdate = true;

      // Animate rain falling
      const rainPosAttr = rainGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < rainCount; i++) {
        let ry = rainPosAttr.getY(i) - 0.45;
        if (ry < -0.5) ry = 30;
        rainPosAttr.setY(i, ry);
      }
      rainPosAttr.needsUpdate = true;

      // Subtle lantern flicker
      const flicker = Math.sin(elapsedTime * 6) * 0.12 + Math.cos(elapsedTime * 14) * 0.06;
      for (let light of lanternLights) {
        light.intensity = 1.2 + flicker;
      }

      // Compute camera position from scroll progress (0.0 -> 1.0)
      const p = Math.max(0, Math.min(1, scrollRef.current));
      const totalSegments = cameraWaypoints.length - 1;
      const segment = Math.min(Math.floor(p * totalSegments), totalSegments - 1);
      const segT = (p * totalSegments) - segment;

      const wpStart = cameraWaypoints[segment];
      const wpEnd = cameraWaypoints[segment + 1];

      // Smooth Hermite / Cosine interpolation between waypoints
      const smoothT = (1 - Math.cos(segT * Math.PI)) / 2;

      currentPos.lerpVectors(wpStart.pos, wpEnd.pos, smoothT);
      currentTarget.lerpVectors(wpStart.target, wpEnd.target, smoothT);

      // Apply mouse parallax
      camera.position.x = currentPos.x + mouseRef.current.x * 0.8;
      camera.position.y = currentPos.y - mouseRef.current.y * 0.5;
      camera.position.z = currentPos.z;

      camera.lookAt(
        currentTarget.x + mouseRef.current.x * 0.4,
        currentTarget.y - mouseRef.current.y * 0.3,
        currentTarget.z
      );

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      groundGeo.dispose();
      moonGeo.dispose();
      emberGeo.dispose();
      rainGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
