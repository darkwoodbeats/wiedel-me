import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ExtrudeGeometry,
  Path,
  Quaternion,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from "three";
import type { SVGResult } from "three/addons/loaders/SVGLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MOTION } from "./config";

/**
 * The brand mark, machined into the cube's three sky-facing faces (local +X, +Y, +Z: the faces
 * around its top corner).
 *
 * The mark's outlines come straight from the SVG (via three's SVGLoader). Each marked face is
 * rebuilt as a square with those outlines cut out, and a shallow pocket sits behind the cut:
 * walls from a zero-bevel extrusion, and a floor. The existing lights and reflections then show
 * the depth, with no extra light or texture involved.
 */

export interface MarkPlacement {
  /** The marked face's outward normal, in the cube's local space. */
  normal: Vector3;
  /** Rotation of the mark within the face, in radians, so it reads upright when seen head-on. */
  roll: number;
}

export interface MarkedCube {
  /** The cube: its plain faces plus the faces with the mark cut out. */
  cube: BufferGeometry;
  /** The pockets behind the cuts: their walls and floors. */
  recess: BufferGeometry;
}

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

/** Rotation that carries the +Z face (where the mark is built) onto the face with this normal. */
const faceRotation = (normal: Vector3) => new Quaternion().setFromUnitVectors(Z, normal);

/** Search step, in seconds of scene time. */
const STEP = 0.1;
/** Look ahead one full turn of the cube. */
const TURN = (2 * Math.PI) / MOTION.cubeSpin;

/**
 * Places a mark on each of the cube's sky-facing faces (local +X, +Y, +Z). Each mark is rolled to
 * read upright at the moment its face points most directly at the viewer during the first turn
 * after the page opens, when it's easiest to see.
 *
 * @param orient The cube's orientation at scene time t, written into `out`.
 * @param start Scene time when the page opens.
 * @param toViewer World-space direction from the cube toward the camera.
 */
export function placeMarks(
  orient: (t: number, out: Quaternion) => Quaternion,
  start: number,
  toViewer: Vector3,
): MarkPlacement[] {
  const pose = new Quaternion();
  const n = new Vector3();
  const facing = (axis: Vector3, t: number) =>
    n.copy(axis).applyQuaternion(orient(t, pose)).dot(toViewer);

  return [X, Y, Z].map((axis) => {
    let peak = start;
    for (let t = start; t < start + TURN; t += STEP) {
      if (facing(axis, t) > facing(axis, peak)) peak = t;
    }

    // World "up", as it lies across the face at that moment.
    const normal = axis.clone();
    const toLocal = orient(peak, pose).invert();
    const up = Y.clone().applyQuaternion(toLocal);
    up.addScaledVector(normal, -up.dot(normal));
    const q = faceRotation(normal);
    const u = X.clone().applyQuaternion(q);
    const v = Y.clone().applyQuaternion(q);
    return { normal, roll: Math.atan2(-up.dot(u), up.dot(v)) };
  });
}

/**
 * The mark's outlines in face space: centred, Y up, `width` wide, rotated by `roll`.
 * Marks with interior holes (like an "O") would also need those islands added back to the face;
 * this mark has none.
 */
function markOutlines(svg: SVGResult, width: number, roll: number) {
  const outlines = svg.paths
    .flatMap((path) => path.toShapes())
    .map((shape) =>
      // SVG polygons repeat their first point to close; drop repeats before triangulating.
      shape.getPoints().filter((p, i, all) => !p.equals(all[(i + 1) % all.length])),
    );

  const all = outlines.flat();
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const scale = width / (maxX - minX);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cos = Math.cos(roll);
  const sin = Math.sin(roll);

  return outlines.map((points) =>
    points.map((p) => {
      // SVG's y axis points down; the face's points up.
      const x = (p.x - cx) * scale;
      const y = -(p.y - cy) * scale;
      return new Vector2(x * cos - y * sin, x * sin + y * cos);
    }),
  );
}

/** Copies the triangles of the given material groups out of a non-indexed geometry. */
function pickGroups(geometry: BufferGeometry, materialIndex: number) {
  const picked = new BufferGeometry();
  for (const name of ["position", "normal", "uv"]) {
    const attribute = geometry.getAttribute(name);
    const size = attribute.itemSize;
    const values: number[] = [];
    for (const group of geometry.groups) {
      if (group.materialIndex !== materialIndex) continue;
      const from = group.start * size;
      values.push(...(attribute.array as Float32Array).subarray(from, from + group.count * size));
    }
    picked.setAttribute(name, new BufferAttribute(new Float32Array(values), size));
  }
  return picked;
}

/** A non-indexed box with the faces whose normals match `removed` taken out. */
function boxWithoutFaces(side: number, removed: Vector3[]) {
  const box = new BoxGeometry(side, side, side).toNonIndexed();
  const position = box.getAttribute("position");
  const normals = box.getAttribute("normal");
  const uv = box.getAttribute("uv");
  const keep = { position: [] as number[], normal: [] as number[], uv: [] as number[] };
  for (let i = 0; i < position.count; i += 3) {
    const n = new Vector3().fromBufferAttribute(normals, i);
    if (removed.some((normal) => n.dot(normal) > 0.99)) continue;
    for (let k = i; k < i + 3; k++) {
      keep.position.push(position.getX(k), position.getY(k), position.getZ(k));
      keep.normal.push(normals.getX(k), normals.getY(k), normals.getZ(k));
      keep.uv.push(uv.getX(k), uv.getY(k));
    }
  }
  box.dispose();
  const result = new BufferGeometry();
  result.setAttribute("position", new BufferAttribute(new Float32Array(keep.position), 3));
  result.setAttribute("normal", new BufferAttribute(new Float32Array(keep.normal), 3));
  result.setAttribute("uv", new BufferAttribute(new Float32Array(keep.uv), 2));
  return result;
}

interface MarkOptions {
  /** One entry per marked face. */
  marks: MarkPlacement[];
  /** The cube's side length. */
  side: number;
  /** Mark width as a fraction of the face. */
  width: number;
  /** How deep the mark is cut, in world units. */
  depth: number;
}

/** One marked face, built on +Z and then turned onto its own face: the cut-out face and its pocket. */
function markedFace(
  svg: SVGResult,
  side: number,
  width: number,
  depth: number,
  mark: MarkPlacement,
) {
  const h = side / 2;
  const outlines = markOutlines(svg, side * width, mark.roll);
  const shapes = outlines.map((points) => new Shape(points));
  const rotation = faceRotation(mark.normal);

  // The face: a square with the mark cut out.
  const faceShape = new Shape([
    new Vector2(-h, -h),
    new Vector2(h, -h),
    new Vector2(h, h),
    new Vector2(-h, h),
  ]);
  faceShape.holes = outlines.map((points) => new Path(points));
  const indexedFace = new ShapeGeometry(faceShape);
  const face = indexedFace.toNonIndexed().translate(0, 0, h).applyQuaternion(rotation);

  // The pocket: a floor `depth` below the face, and walls from the floor up to the face.
  const indexedFloor = new ShapeGeometry(shapes);
  const floor = indexedFloor.toNonIndexed().translate(0, 0, h - depth);
  const extruded = new ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: 1 });
  const walls = pickGroups(extruded, 1).translate(0, 0, h - depth);
  const recess = mergeGeometries([floor, walls]).applyQuaternion(rotation);

  [indexedFace, indexedFloor, floor, extruded, walls].forEach((g) => g.dispose());
  return { face, recess };
}

export function buildMarkedCube(svg: SVGResult, options: MarkOptions): MarkedCube {
  const { marks, side, width, depth } = options;
  const faces = marks.map((mark) => markedFace(svg, side, width, depth, mark));
  const rest = boxWithoutFaces(
    side,
    marks.map((mark) => mark.normal),
  );

  const cube = mergeGeometries([rest, ...faces.map((f) => f.face)]);
  const recess = mergeGeometries(faces.map((f) => f.recess));

  [rest, ...faces.flatMap((f) => [f.face, f.recess])].forEach((g) => g.dispose());
  return { cube, recess };
}
