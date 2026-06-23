import type * as THREE from "three";
import {
  SHUTTLE_MODEL_PATHS,
  SHUTTLE_MODEL_SIZE_METERS,
} from "@/lib/shuttle/map-3d-config";

const WEDDING_GOLD = 0xc3a379;
const WEDDING_DARK = 0x2a2723;

export function normalizeModelToMeters(
  THREE: typeof import("three"),
  model: THREE.Object3D,
  targetSizeMeters: number,
) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  model.scale.setScalar(targetSizeMeters / maxDim);

  const grounded = new THREE.Box3().setFromObject(model);
  model.position.y -= grounded.min.y;
}

export function createFallbackBus(THREE: typeof import("three")): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.4, 10),
    new THREE.MeshStandardMaterial({ color: WEDDING_DARK, metalness: 0.35, roughness: 0.45 }),
  );
  body.position.y = 1.8;
  group.add(body);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(4.25, 0.35, 10.05),
    new THREE.MeshStandardMaterial({ color: WEDDING_GOLD, metalness: 0.2, roughness: 0.5 }),
  );
  stripe.position.y = 2.1;
  group.add(stripe);

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.2, 2.4),
    new THREE.MeshStandardMaterial({
      color: 0x9ec9ff,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
    }),
  );
  glass.position.set(0, 2.5, 3.2);
  group.add(glass);

  return group;
}

export function createFallbackStop(THREE: typeof import("three")): THREE.Group {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 4.5, 12),
    new THREE.MeshStandardMaterial({ color: WEDDING_DARK, metalness: 0.25, roughness: 0.55 }),
  );
  pole.position.y = 2.25;
  group.add(pole);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.6, 0.12),
    new THREE.MeshStandardMaterial({ color: WEDDING_GOLD, metalness: 0.15, roughness: 0.6 }),
  );
  sign.position.set(0, 4.6, 0);
  group.add(sign);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.1, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0x8a8076, metalness: 0.1, roughness: 0.85 }),
  );
  base.position.y = 0.175;
  group.add(base);

  return group;
}

export async function loadShuttleModel(
  THREE: typeof import("three"),
  GLTFLoader: typeof import("three/examples/jsm/loaders/GLTFLoader.js").GLTFLoader,
  url: string,
  fallback: THREE.Group,
  targetSizeMeters: number,
): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(url);
    const group = new THREE.Group();
    group.add(gltf.scene);
    normalizeModelToMeters(THREE, group, targetSizeMeters);
    return group;
  } catch {
    const clone = fallback.clone(true);
    normalizeModelToMeters(THREE, clone, targetSizeMeters);
    return clone;
  }
}

export function setHighlight(
  object: THREE.Object3D,
  highlighted: boolean,
  THREE: typeof import("three"),
) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!("emissive" in material)) continue;
      const standard = material as THREE.MeshStandardMaterial;
      if (!standard.userData.baseEmissive) {
        standard.userData.baseEmissive = standard.emissive?.clone?.() ?? new THREE.Color(0x000000);
        standard.userData.baseIntensity = standard.emissiveIntensity ?? 0;
      }
      if (highlighted) {
        standard.emissive = new THREE.Color(WEDDING_GOLD);
        standard.emissiveIntensity = 0.85;
      } else {
        standard.emissive = standard.userData.baseEmissive as THREE.Color;
        standard.emissiveIntensity = standard.userData.baseIntensity as number;
      }
    }
  });
}

export { SHUTTLE_MODEL_PATHS, SHUTTLE_MODEL_SIZE_METERS };
