import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Sky } from "@react-three/drei";
import * as THREE from "three";

import { useMemo } from "react";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

function FoxModel({ url, position }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const mixer = useRef();

  useEffect(() => {
    if (animations && scene) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        mixer.current.clipAction(clip).play();
      });
    }
  }, [animations, scene]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  return (
    <primitive
      ref={group}
      object={scene}
      position={position}
      scale={[0.02, 0.02, 0.02]}
    />
  );
}

function Model({ url, isZoomed, setIsZoomed, targetZoom, position }) {
  const { scene } = useGLTF(url);
  const group = useRef();

  // Clone the scene so each model is independent
  const clonedScene = useMemo(() => clone(scene), [scene]);

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
      object={clonedScene}
      ref={group}
      onClick={handleClick}
      position={position}
    />
  );
}

export default function ModelViewer() {
  const [isZoomed, setIsZoomed] = useState(false);
  const targetZoom = 3; // Zoom scale on click
  const controlsRef = useRef();

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
          url={process.env.PUBLIC_URL + "/models/house.glb"}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
          targetZoom={targetZoom}
          position={[-2, 0, 0]}
        />
        <Model
          url={process.env.PUBLIC_URL + "/models/house.glb"}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
          targetZoom={targetZoom}
          position={[0, 0, 0]}
        />
        <FoxModel
          url={process.env.PUBLIC_URL + "/models/Fox/Fox.gltf"}
          position={[-1, -0.5, -2]}
        />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE, // Right-click = rotate
          MIDDLE: THREE.MOUSE.DOLLY, // Scroll wheel = zoom
          RIGHT: THREE.MOUSE.PAN, // Drag = pan
        }}
      />
    </Canvas>
  );
}
