import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { Direction } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";
import BackgroundScene from "./BackgroundScene.tsx";

function App() {
    const {
        setup: {
            systemCalls: { spawn, move },
            clientComponents: { Position, Moves, DirectionsAvailable },
        },
        account,
    } = useDojo();

    const [clipboardStatus, setClipboardStatus] = useState({
        message: "",
        isError: false,
    });

    // entity id we are syncing
    const entityId = getEntityIdFromKeys([
        BigInt(account?.account.address),
    ]) as Entity;

    // get current component values
    const position = useComponentValue(Position, entityId);
    const moves = useComponentValue(Moves, entityId);
    const directions = useComponentValue(DirectionsAvailable, entityId);

    console.log("directions", directions);

    const handleRestoreBurners = async () => {
        try {
            await account?.applyFromClipboard();
            setClipboardStatus({
                message: "Burners restored successfully!",
                isError: false,
            });
        } catch (error) {
            setClipboardStatus({
                message: `Failed to restore burners from clipboard`,
                isError: true,
            });
        }
    };

    useEffect(() => {
        if (clipboardStatus.message) {
            const timer = setTimeout(() => {
                setClipboardStatus({ message: "", isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [clipboardStatus.message]);

    return (
        <>
      <BackgroundScene />

            {clipboardStatus.message && (
                <div className={clipboardStatus.isError ? "error" : "success"}>
                    {clipboardStatus.message}
                </div>
            )}

            <div className="card">
                <div>{`burners deployed: ${account.count}`}</div>
                <div>
                    select signer:{" "}
                    <select
                        value={account ? account.account.address : ""}
                        onChange={(e) => account.select(e.target.value)}
                    >
                        {account?.list().map((account, index) => {
                            return (
                                <option value={account.address} key={index}>
                                    {account.address}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <button onClick={() => account.clear()}>
                        Clear burners
                    </button>
                    <p>
                        You will need to Authorise the contracts before you can
                        use a burner. See readme.
                    </p>
                </div>
            </div>

            <div className="card">
                <button onClick={() => spawn(account.account)}>Spawn</button>
                <div>
                    Moves Left: {moves ? `${moves.remaining}` : "Need to Spawn"}
                </div>
                <div>
                    Position:{" "}
                    {position
                        ? `${position?.vec.x}, ${position?.vec.y}`
                        : "Need to Spawn"}
                </div>

                <div>{moves && moves.last_direction}</div>

                <div>
                    <div>Available Positions</div>
                    {directions?.directions.map((a: any, index: any) => (
                        <div key={index} className="">
                            {a}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div>
                    <button
                        onClick={() =>
                            position && position.vec.y > 0
                                ? move(account.account, Direction.Up)
                                : console.log("Reach the borders of the world.")
                        }
                    >
                        Move Up
                    </button>
                </div>
                <div>
                    <button
                        onClick={() =>
                            position && position.vec.x > 0
                                ? move(account.account, Direction.Left)
                                : console.log("Reach the borders of the world.")
                        }
                    >
                        Move Left
                    </button>
                    <button
                        onClick={() => move(account.account, Direction.Right)}
                    >
                        Move Right
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => move(account.account, Direction.Down)}
                    >
                        Move Down
                    </button>
                </div>
            </div>
        </>
    );
}

export default App;


// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import axios from 'axios';
// import './App.css'; // For CSS styling

// const App: React.FC = () => {
//   const mountRef = useRef<HTMLDivElement>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   let scene: THREE.Scene;
//   let camera: THREE.PerspectiveCamera;
//   let renderer: THREE.WebGLRenderer;
//   let character: THREE.Mesh;
//   let moveForward = false;
//   let moveBackward = false;
//   let moveLeft = false;
//   let moveRight = false;
//   let velocity = new THREE.Vector3();
//   let direction = new THREE.Vector3();
//   let prevTime = performance.now();

//   const playerAddress = '0x33246ce85ebdc292e6a5c5b4dd51fab2757be34b8ffda847ca6925edf31cb67';

//   const init = () => {
//     // Scene setup
//     scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x87ceeb);

//     // Camera setup
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.y = 1.6;

//     // Renderer setup
//     renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current?.appendChild(renderer.domElement);

//     // Lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
//     directionalLight.position.set(0, 10, 0);
//     scene.add(directionalLight);

//     // Character
//     const geometry = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 32);
//     const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
//     character = new THREE.Mesh(geometry, material);
//     character.position.y = 0.8;
//     scene.add(character);

//     // Ground and walls
//     createEnvironment();

//     // Event listeners
//     document.addEventListener('keydown', onKeyDown);
//     document.addEventListener('keyup', onKeyUp);
//     window.addEventListener('resize', onWindowResize);

//     animate();
//   };

//   const createEnvironment = () => {
//     const groundGeometry = new THREE.PlaneGeometry(20, 20);
//     const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
//     const ground = new THREE.Mesh(groundGeometry, groundMaterial);
//     ground.rotation.x = Math.PI / 2;
//     scene.add(ground);
//   };

//   const onKeyDown = async (event: KeyboardEvent) => {
//     switch (event.code) {
//       case 'ArrowUp':
//       case 'KeyW':
//         moveForward = true;
//         await sendMoveToBlockchain(3);
//         break;
//       case 'ArrowDown':
//       case 'KeyS':
//         moveBackward = true;
//         await sendMoveToBlockchain(4);
//         break;
//       case 'ArrowLeft':
//       case 'KeyA':
//         moveLeft = true;
//         await sendMoveToBlockchain(1);
//         break;
//       case 'ArrowRight':
//       case 'KeyD':
//         moveRight = true;
//         await sendMoveToBlockchain(2);
//         break;
//     }
//   };

//   const onKeyUp = (event: KeyboardEvent) => {
//     switch (event.code) {
//       case 'ArrowUp':
//       case 'KeyW':
//         moveForward = false;
//         break;
//       case 'ArrowDown':
//       case 'KeyS':
//         moveBackward = false;
//         break;
//       case 'ArrowLeft':
//       case 'KeyA':
//         moveLeft = false;
//         break;
//       case 'ArrowRight':
//       case 'KeyD':
//         moveRight = false;
//         break;
//     }
//   };

//   const onWindowResize = () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   };

//   const animate = () => {
//     requestAnimationFrame(animate);
//     const time = performance.now();
//     const delta = (time - prevTime) / 1000;

//     velocity.x = 0;
//     velocity.z = 0;

//     direction.z = Number(moveForward) - Number(moveBackward);
//     direction.x = Number(moveRight) - Number(moveLeft);
//     direction.normalize();

//     const speed = 5;
//     if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
//     if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

//     character.position.x += velocity.x;
//     character.position.z += velocity.z;

//     camera.position.x = character.position.x;
//     camera.position.z = character.position.z + 2;

//     prevTime = time;
//     renderer.render(scene, camera);
//   };

//   const sendMoveToBlockchain = async (direction: number) => {
//     try {
//       await axios.post('http://localhost:3000/proxy', {
//         jsonrpc: '2.0',
//         method: 'move',
//         params: [playerAddress, direction],
//         id: 1,
//       });
//     } catch (error) {
//       console.error('Error invoking move:', error);
//     }
//   };

//   useEffect(() => {
//     init();
//   }, []);

//   return (
//     <div>
//       <div id="prompt-container">
//         <input
//           type="text"
//           id="prompt-input"
//           placeholder="Enter your world description..."
//           onKeyPress={async (e) => {
//             if (e.key === 'Enter' && !isLoading) {
//               setIsLoading(true);
//               try {
//                 const response = await axios.post('/generate', {
//                   prompt: e.currentTarget.value,
//                 });
//                 console.log(response.data);
//               } catch (err) {
//                 console.error(err);
//               } finally {
//                 setIsLoading(false);
//               }
//             }
//           }}
//         />
//         <div id="instructions">
//           Use WASD or Arrow Keys to move around<br />
//           Enter a prompt and press Enter to generate a new world
//         </div>
//       </div>
//       {isLoading && <div id="loading">Generating your world...</div>}
//       <div ref={mountRef}></div>
//     </div>
//   );
// };

// export default App;
