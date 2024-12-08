// src/BackgroundScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Component to set the background color
const SceneSetup: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    // Set the background color to sky blue
    scene.background = new THREE.Color(0x87ceeb);
  }, [scene]);

  return null;
};

// Character component (simple cylinder)
const Character: React.FC = () => {
  const characterRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  const moveState = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
  });

  // Keydown event handler
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveState.current.moveForward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveState.current.moveBackward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveState.current.moveLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveState.current.moveRight = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveState.current.moveForward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveState.current.moveBackward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveState.current.moveLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveState.current.moveRight = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (characterRef.current) {
      direction.current.z = Number(moveState.current.moveForward) - Number(moveState.current.moveBackward);
      direction.current.x = Number(moveState.current.moveRight) - Number(moveState.current.moveLeft);
      direction.current.normalize();

      const speed = 5;
      velocity.current.x -= direction.current.x * speed * delta;
      velocity.current.z -= direction.current.z * speed * delta;

      characterRef.current.position.x += velocity.current.x;
      characterRef.current.position.z += velocity.current.z;

      // Keep character within bounds
      characterRef.current.position.x = Math.max(-9, Math.min(9, characterRef.current.position.x));
      characterRef.current.position.z = Math.max(-9, Math.min(9, characterRef.current.position.z));
    }
  });

  return (
    <mesh ref={characterRef} position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 1.6, 32]} />
      <meshPhongMaterial color={0x00ff00} />
    </mesh>
  );
};

// Environment component (ground and walls)
const Environment: React.FC = () => {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhongMaterial color={0x808080} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshPhongMaterial color={0x808080} />
      </mesh>

      <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshPhongMaterial color={0x808080} />
      </mesh>

      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshPhongMaterial color={0x808080} />
      </mesh>

      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshPhongMaterial color={0x808080} />
      </mesh>
    </>
  );
};

const BackgroundScene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
      <SceneSetup />
      <Environment />
      <Character />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 0]} intensity={0.8} />
      <OrbitControls />
    </Canvas>
  );
};

export default BackgroundScene;
