import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Sky } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, isZoomed, setIsZoomed, targetZoom }) {
  const { scene } = useGLTF(url);
  const group = useRef();

  useFrame(() => {
    if (group.current) {
      const targetScale = isZoomed ? targetZoom : 1.5;
      group.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <primitive
      object={scene}
      ref={group}
      onClick={handleClick}
      position={[0, 0, 0]}
    />
  );
}

export default function ModelViewer() {
  const [isZoomed, setIsZoomed] = useState(false);
  const targetZoom = 3; // Zoom scale on click

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Sky
        sunPosition={[100, 20, 100]}
        turbidity={1}
        rayleigh={1}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        azimuth={180}
        inclination={0.49}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <Suspense fallback={null}>
        <Model
          url="/models/house.glb"
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
          targetZoom={targetZoom}
        />
      </Suspense>
      <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />
    </Canvas>
  );
}
