import type Context from '@giro3d/giro3d/core/Context.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Sphere,
  Vector3,
} from 'three';
import { IfcAPI, type PlacedGeometry } from 'web-ifc';

export interface IfcSource {
  name: string;
  url: string;
  position?: Vector3;
}

/** Identity of an IFC element, stored in `mesh.userData` so picking can resolve it. */
export interface IfcElementMeta {
  expressID: number;
  globalId: string | null;
  ifcClass: string | null;
  name: string | null;
}

/**
 * Renders a raw IFC file in the browser with web-ifc. Intended for previews and small
 * models; production models go through the 3D Tiles pipeline (docs/decisions/0003).
 *
 * TODO: parse in a Web Worker, batch meshes per material, apply IFC georeferencing.
 */
export default class IfcEntity extends Entity3D {
  public override readonly type = 'IfcEntity' as const;

  private readonly source: IfcSource;
  private readonly boundingSphere = new Sphere();

  constructor(source: IfcSource) {
    super({ object3d: new Group(), name: source.name });
    this.source = source;
  }

  protected override async preprocess(): Promise<void> {
    const response = await fetch(this.source.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch IFC ${this.source.url}: ${response.status}`);
    }
    const data = new Uint8Array(await response.arrayBuffer());

    const ifcApi = new IfcAPI();
    ifcApi.SetWasmPath('/wasm/');
    await ifcApi.Init();

    const modelID = ifcApi.OpenModel(data);
    const group = new Group();

    ifcApi.StreamAllMeshes(modelID, (flatMesh) => {
      const meta = readElementMeta(ifcApi, modelID, flatMesh.expressID);
      const placedGeometries = flatMesh.geometries;
      for (let i = 0; i < placedGeometries.size(); i++) {
        const placedGeometry = placedGeometries.get(i);
        const geometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);
        const verts = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());

        const mesh = buildMesh(verts, indices, placedGeometry);
        mesh.name = meta.name ?? '';
        mesh.userData = { ...meta };
        group.add(mesh);

        // Emscripten object; not in web-ifc's typings.
        (geometry as unknown as { delete(): void }).delete();
      }
    });

    ifcApi.CloseModel(modelID);

    // IFC is Y-up; giro3d scenes are Z-up.
    group.rotateX(Math.PI / 2);
    if (this.source.position) {
      group.position.copy(this.source.position);
    }
    group.updateMatrixWorld(true);

    this.object3d.add(group);
    this.onObjectCreated(group);
    new Box3().setFromObject(this.object3d).getBoundingSphere(this.boundingSphere);
    this.notifyChange(this.object3d);
  }

  // giro3d derives the camera near/far planes from each entity's distance range.
  // Without this the model is clipped away entirely.
  override postUpdate(context: Context): void {
    if (this.boundingSphere.isEmpty()) return;
    const distance = context.distance.plane.distanceToPoint(this.boundingSphere.center);
    const radius = this.boundingSphere.radius;
    this._distance.min = Math.min(this._distance.min, distance - radius);
    this._distance.max = Math.max(this._distance.max, distance + radius);
  }
}

function readElementMeta(api: IfcAPI, modelID: number, expressID: number): IfcElementMeta {
  try {
    const line = api.GetLine(modelID, expressID);
    return {
      expressID,
      globalId: line?.GlobalId?.value ?? null,
      ifcClass: api.GetNameFromTypeCode(api.GetLineType(modelID, expressID)) ?? null,
      name: line?.Name?.value ?? null,
    };
  } catch {
    return { expressID, globalId: null, ifcClass: null, name: null };
  }
}

function buildMesh(verts: Float32Array, indices: Uint32Array, placedGeometry: PlacedGeometry): Mesh {
  // web-ifc interleaves position (xyz) and normal (xyz).
  const vertexCount = verts.length / 6;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = verts[i * 6];
    positions[i * 3 + 1] = verts[i * 6 + 1];
    positions[i * 3 + 2] = verts[i * 6 + 2];
    normals[i * 3] = verts[i * 6 + 3];
    normals[i * 3 + 1] = verts[i * 6 + 4];
    normals[i * 3 + 2] = verts[i * 6 + 5];
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));

  const { x: r, y: g, z: b, w: a } = placedGeometry.color;
  const material = new MeshStandardMaterial({
    color: new Color(r, g, b),
    opacity: a,
    transparent: a < 1,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.applyMatrix4(new Matrix4().fromArray(placedGeometry.flatTransformation));
  return mesh;
}
