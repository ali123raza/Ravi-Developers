import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, Text, Box } from "@react-three/drei";
import { X, RotateCcw, ZoomIn } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import * as THREE from "three";

interface PlotInfo {
  id: string;
  plotNumber: string;
  size: string;
  type: string;
  price: number;
  status: string;
  area: number;
  facing?: string | null;
  isCorner: boolean;
  projectName?: string | null;
}

interface Props {
  plot: PlotInfo;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Available: "#16a34a",
  Booked: "#ca8a04",
  Reserved: "#ea580c",
  Sold: "#dc2626",
};

function PlotScene({ plot }: { plot: PlotInfo }) {
  const plotRef = useRef<THREE.Mesh>(null);
  const plotWidth = 8;
  const plotDepth = plot.type === "Farmhouse" ? 20 : 10;
  const plotColor = STATUS_COLORS[plot.status] || "#16a34a";

  useFrame((state) => {
    if (plotRef.current) {
      plotRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>

      {/* Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 14]} receiveShadow>
        <planeGeometry args={[60, 6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -14]} receiveShadow>
        <planeGeometry args={[60, 6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 60]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>

      {/* Neighboring plots */}
      {[
        [-10, 0, 0], [10, 0, 0],
        [0, 0, -12], [0, 0, 12],
        [-10, 0, -12], [10, 0, -12],
        [-10, 0, 12], [10, 0, 12],
      ].map(([x, , z], i) => (
        <mesh key={i} position={[x, 0.2, z as number]} castShadow receiveShadow>
          <boxGeometry args={[7.5, 0.4, 9.5]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#fde68a" : "#d1fae5"} roughness={0.7} />
        </mesh>
      ))}

      {/* Main plot - highlighted */}
      <mesh ref={plotRef} position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[plotWidth, 0.6, plotDepth]} />
        <meshStandardMaterial color={plotColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Plot boundary markers */}
      {[
        [plotWidth / 2, 0.6, plotDepth / 2],
        [-plotWidth / 2, 0.6, plotDepth / 2],
        [plotWidth / 2, 0.6, -plotDepth / 2],
        [-plotWidth / 2, 0.6, -plotDepth / 2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}

      {/* Plot Number sign */}
      <group position={[0, 1.8, plotDepth / 2 + 0.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 1.2, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <Text
          position={[0, 0.15, 0.1]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          Plot {plot.plotNumber}
        </Text>
        <Text
          position={[0, -0.25, 0.1]}
          fontSize={0.25}
          color="#86efac"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {plot.size} | {plot.status}
        </Text>
      </group>

      {/* Trees around */}
      {[
        [-18, 0, -18], [18, 0, -18],
        [-18, 0, 18], [18, 0, 18],
        [0, 0, -25], [0, 0, 25],
        [-25, 0, 0], [25, 0, 0],
      ].map(([x, , z], i) => (
        <group key={i} position={[x, 0, z as number]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 3, 6]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      ))}

      <Sky sunPosition={[100, 20, 100]} />
    </>
  );
}

export default function VirtualTour({ plot, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <div className="text-white font-bold text-lg">Virtual Tour — Plot {plot.plotNumber}</div>
          <div className="text-gray-300 text-sm">{plot.projectName || "Ravi Developers"} | {plot.size} | {plot.type}</div>
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [15, 12, 20], fov: 55 }}
        className="flex-1"
      >
        <Suspense fallback={null}>
          <PlotScene plot={plot} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
          />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-xs">Price</div>
              <div className="text-white font-bold">{formatPKR(plot.price)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Area</div>
              <div className="text-white font-bold">{plot.area.toLocaleString()} sq.ft</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Status</div>
              <div className={`font-bold ${plot.status === "Available" ? "text-green-400" : "text-yellow-400"}`}>
                {plot.status}
              </div>
            </div>
            {plot.facing && (
              <div className="text-center">
                <div className="text-gray-400 text-xs">Facing</div>
                <div className="text-white font-bold">{plot.facing}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <RotateCcw size={12} /> Drag to rotate
            <ZoomIn size={12} className="ml-2" /> Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
}
