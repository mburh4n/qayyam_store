import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import type { Mesh, Group } from 'three';

function GoldKnot() {
	const groupRef = useRef<Group>(null!);

	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		groupRef.current.rotation.y = t * 0.38;
		groupRef.current.rotation.x = Math.sin(t * 0.22) * 0.12;
	});

	return (
		<group ref={groupRef}>
			<mesh
				castShadow
				receiveShadow
			>
				<torusKnotGeometry args={[0.88, 0.27, 256, 32, 2, 3]} />
				<meshStandardMaterial
					color="#c9a84c"
					metalness={1.0}
					roughness={0.1}
					envMapIntensity={2.2}
				/>
			</mesh>
		</group>
	);
}

function GoldRing() {
	const meshRef = useRef<Mesh>(null!);

	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		meshRef.current.rotation.y = t * 0.4;
		meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.08;
	});

	return (
		<group>
			<mesh
				ref={meshRef}
				castShadow
				receiveShadow
			>
				<torusGeometry args={[1.1, 0.32, 128, 256]} />
				<meshStandardMaterial
					color="#c9a84c"
					metalness={1.0}
					roughness={0.09}
					envMapIntensity={2.5}
				/>
			</mesh>
			<mesh
				position={[0, 1.1, 0.32]}
				castShadow
			>
				<octahedronGeometry args={[0.22, 3]} />
				<meshPhysicalMaterial
					color="#e8f8ff"
					metalness={0.05}
					roughness={0}
					transmission={0.92}
					thickness={0.4}
					ior={2.42}
					envMapIntensity={3}
				/>
			</mesh>
		</group>
	);
}

type SceneVariant = 'knot' | 'ring';

function Scene({ variant }: { variant: SceneVariant }) {
	return (
		<>
			<ambientLight intensity={0.12} />
			<directionalLight
				position={[6, 8, 4]}
				intensity={1.6}
				color="#fffaed"
				castShadow
				shadow-mapSize={[1024, 1024]}
			/>
			<pointLight
				position={[-4, 2, -4]}
				intensity={0.7}
				color="#4466cc"
			/>
			<pointLight
				position={[3, -3, 3]}
				intensity={0.4}
				color="#ffeecc"
			/>
			{variant === 'knot' ? <GoldKnot /> : <GoldRing />}
			<ContactShadows
				position={[0, -2.2, 0]}
				opacity={0.45}
				scale={9}
				blur={2.5}
				far={4}
			/>
			<Environment preset="studio" />
		</>
	);
}

interface JewelryViewerProps {
	variant?: SceneVariant;
	className?: string;
}

export default function JewelryViewer({
	variant = 'ring',
	className = ''
}: JewelryViewerProps) {
	return (
		<div className={`w-full h-full min-h-[420px] ${className}`}>
			<Canvas
				camera={{ position: [0, 0, 4.2], fov: 48 }}
				gl={{ antialias: true }}
				dpr={[1, 2]}
				shadows
			>
				<Suspense fallback={null}>
					<Scene variant={variant} />
				</Suspense>
				<OrbitControls
					enablePan={false}
					enableZoom
					minDistance={2.5}
					maxDistance={9}
					autoRotate={false}
					makeDefault
				/>
			</Canvas>
		</div>
	);
}
