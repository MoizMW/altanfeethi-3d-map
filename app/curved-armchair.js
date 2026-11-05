import * as THREE from 'three';

export const loungeChairColor = '#3d4a55';
export const loungePillowTexturePath = '/shared/materials/textures/lounge-pillow/pillow-botanical-clean.png';

let weaveTexture, pillowTexture;
export function fabricWeave() {
  if (weaveTexture) return weaveTexture;
  const size = 128, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const thread = Math.sin(x * Math.PI / 2) * 11 + Math.sin(y * Math.PI / 2) * 9;
    const grain = ((x * 73 + y * 151 + x * y * 19) % 23) - 11;
    const value = Math.round(128 + thread + grain);
    data.set([value, value, value, 255], (y * size + x) * 4);
  }
  weaveTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  weaveTexture.wrapS = weaveTexture.wrapT = THREE.RepeatWrapping;
  weaveTexture.magFilter = THREE.LinearFilter;
  weaveTexture.minFilter = THREE.LinearMipmapLinearFilter;
  weaveTexture.generateMipmaps = true;
  weaveTexture.needsUpdate = true;
  weaveTexture.userData.shared = true;
  return weaveTexture;
}

function pillowPrint() {
  if (typeof document === 'undefined') return null;
  if (!pillowTexture) {
    pillowTexture = new THREE.TextureLoader().load(loungePillowTexturePath);
    pillowTexture.colorSpace = THREE.SRGBColorSpace;
    pillowTexture.anisotropy = 8;
    pillowTexture.userData.shared = true;
  }
  return pillowTexture;
}

// The generated fabric is already flat: map it directly, with no photographed
// perspective, baked folds or projective distortion.
export const pillowFabricUV = (u, v) => [u, v];

function addMesh(group, name, geometry, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name; mesh.position.fromArray(position);
  mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
  return mesh;
}

// Extrusions duplicate vertices at bevels, and the shell has a UV seam. Average
// normals by position across those splits so the upholstery shades continuously.
export function smoothUpholsteryNormals(geometry) {
  const positions = geometry.attributes.position, indices = geometry.index;
  const keys = [], sums = new Map();
  for (let i = 0; i < positions.count; i++) {
    const key = [positions.getX(i), positions.getY(i), positions.getZ(i)].map(value => Math.round(value * 1e6)).join('/');
    keys.push(key); if (!sums.has(key)) sums.set(key, new THREE.Vector3());
  }
  const count = indices ? indices.count : positions.count;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < count; i += 3) {
    const triangle = [0, 1, 2].map(j => indices ? indices.getX(i + j) : i + j);
    a.fromBufferAttribute(positions, triangle[0]); b.fromBufferAttribute(positions, triangle[1]); c.fromBufferAttribute(positions, triangle[2]);
    const vertices = [a, b, c], normal = b.clone().sub(a).cross(c.clone().sub(a));
    if (normal.lengthSq() < 1e-20) continue;
    normal.normalize();
    for (let corner = 0; corner < 3; corner++) {
      const first = vertices[(corner + 1) % 3].clone().sub(vertices[corner]).normalize();
      const second = vertices[(corner + 2) % 3].clone().sub(vertices[corner]).normalize();
      sums.get(keys[triangle[corner]]).addScaledVector(normal, Math.acos(THREE.MathUtils.clamp(first.dot(second), -1, 1)));
    }
  }
  const normals = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) sums.get(keys[i]).clone().normalize().toArray(normals, i * 3);
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  return geometry;
}

function curvedShellGeometry() {
  const columns = 80, positions = [], uv = [], indices = [];
  // A padded capsule section gives the top a proper rolled edge rather than
  // tapering the entire back into the thin edge of an ellipse.
  const section = [];
  const flat=14,rolls=18;
  for (let i = 0; i < flat; i++) section.push({t: i / flat, offset: 1 + .20 * Math.sin(Math.PI * i / flat) ** 2, end: 0});
  for (let i = 0; i < rolls; i++) section.push({t: 1, offset: Math.cos(Math.PI * i / rolls), end: Math.sin(Math.PI * i / rolls)});
  for (let i = 0; i < flat; i++) section.push({t: 1 - i / flat, offset: -1 - .32 * Math.sin(Math.PI * i / flat) ** 2, end: 0});
  for (let i = 0; i < rolls; i++) section.push({t: 0, offset: Math.cos(Math.PI + Math.PI * i / rolls), end: Math.sin(Math.PI + Math.PI * i / rolls)});
  const rings = section.length;
  for (let column = 0; column <= columns; column++) {
    const u = column / columns * 2 - 1, angle = u * 2.20, end = Math.abs(u);
    const armDrop = THREE.MathUtils.smoothstep(end, .24, .98);
    const top = .91 - .025 * end * end - .26 * armDrop, bottom = .325 + .012 * end;
    const radius = .052 + .025 * THREE.MathUtils.smoothstep(end, .30, .90);
    for (let ring = 0; ring <= rings; ring++) {
      const {t, offset, end: roll} = section[ring % rings], padding = offset * radius;
      const y = bottom + radius + (top - bottom - 2 * radius) * t + roll * radius;
      const height = (y - bottom) / (top - bottom);
      const radiusX = .285 + .047 * height + .011 * Math.sin(Math.PI * height);
      const radiusZ = .305 + .060 * height;
      const lowerSide = THREE.MathUtils.smoothstep(end, .42, .86) * (1 - THREE.MathUtils.smoothstep(height, .25, .82));
      const innerFace = THREE.MathUtils.clamp((1 - offset) / 2, 0, 1);
      // Blend the lower inner padding into the side, rather than curling it
      // across the usable seat. The outer silhouette stays in the same place.
      const sideMerge = Math.sign(u) * .085 * lowerSide * innerFace;
      positions.push(Math.sin(angle) * (radiusX + padding) + sideMerge, y,
        -Math.cos(angle) * (radiusZ + padding) - .022 + .023 * (1 - height));
      uv.push(column / columns * 5, ring / rings * 3);
    }
  }
  const stride = rings + 1;
  for (let column = 0; column < columns; column++) for (let ring = 0; ring < rings; ring++) {
    const a = column * stride + ring, b = a + stride, c = a + 1, d = b + 1;
    indices.push(a, c, b, b, c, d);
  }
  const caps = [];
  for (const column of [0, columns]) {
    const center = new THREE.Vector3();
    for (let ring = 0; ring < rings; ring++) center.add(new THREE.Vector3().fromArray(positions, (column * stride + ring) * 3));
    center.divideScalar(rings);
    const angle = (column === 0 ? -1 : 1) * 2.20, sign = column === 0 ? -1 : 1;
    const outward = new THREE.Vector3(sign * .15, 0, 1).normalize();
    let previous = column * stride;
    // Rounded arm noses replace the visibly flat triangular end fans.
    for (let step = 1; step < 10; step++) {
      const theta = step / 10 * Math.PI / 2, start = positions.length / 3;
      for (let ring = 0; ring <= rings; ring++) {
        const point = new THREE.Vector3().fromArray(positions, (column * stride + ring) * 3)
          .sub(center).multiplyScalar(Math.cos(theta)).add(center).addScaledVector(outward, .065 * Math.sin(theta));
        point.y -= .075 * Math.sin(theta) ** 2;
        positions.push(...point); uv.push(column / columns * 5 + sign * step / 100, ring / rings * 3);
      }
      for (let ring = 0; ring < rings; ring++) {
        const a = previous + ring, b = a + 1, c = start + ring, d = c + 1;
        if (column === 0) indices.push(a, c, b, b, c, d); else indices.push(a, b, c, b, d, c);
      }
      previous = start;
    }
    caps.push({column, previous, pole: center.addScaledVector(outward, .065).add(new THREE.Vector3(0, -.075, 0))});
  }
  for (const {column, previous, pole} of caps) {
    const index = positions.length / 3; positions.push(...pole); uv.push(column / columns * 5, 1.5);
    for (let ring = 0; ring < rings; ring++) {
      const a = previous + ring, b = a + 1;
      if (column === 0) indices.push(index, b, a); else indices.push(index, a, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices);
  return smoothUpholsteryNormals(geometry);
}

function seatOutline() {
  const outline = new THREE.Shape();
  outline.moveTo(-.27, -.405);
  outline.bezierCurveTo(-.18, -.435, .18, -.435, .27, -.405);
  outline.bezierCurveTo(.36, -.38, .36, -.26, .35, -.10);
  outline.bezierCurveTo(.34, .07, .31, .22, .25, .27);
  outline.bezierCurveTo(.13, .31, -.13, .31, -.25, .27);
  outline.bezierCurveTo(-.31, .22, -.34, .07, -.35, -.10);
  outline.bezierCurveTo(-.36, -.26, -.36, -.38, -.27, -.405);
  return outline;
}

function softSeatGeometry() {
  const outline = seatOutline().getSpacedPoints(96).slice(0, -1);
  const around = outline.length, radial = 24, stride = around + 1;
  const positions = [], uvs = [], indices = [], sideSize = (radial + 1) * stride;
  for (const side of [1, -1]) for (let row = 0; row <= radial; row++) {
    const radius = Math.sin(row / radial * Math.PI / 2);
    for (let column = 0; column <= around; column++) {
      const point = outline[column % around], x = point.x * radius * .98, z = -point.y * radius;
      const dome = Math.sqrt(Math.max(0, 1 - radius ** 12));
      // A few shallow tension creases in the seat replace the completely flat slab.
      const wrinkles = side > 0 ? .0024 * Math.sin(x * 86 + z * 18) * Math.exp(-((x / .17) ** 2) - ((z + .015) / .13) ** 2) : 0;
      positions.push(x, .375 + side * (side > 0 ? .071 : .055) * dome + wrinkles, z);
      uvs.push(x * 6, z * 6);
    }
  }
  for (let side = 0; side < 2; side++) for (let row = 0; row < radial; row++) for (let column = 0; column < around; column++) {
    const a = side * sideSize + row * stride + column, b = a + 1, c = a + stride, d = c + 1;
    if (side === 0) indices.push(a, c, b, b, c, d); else indices.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices);
  return smoothUpholsteryNormals(geometry);
}

export function pillowPoint(u, v, side = 0) {
  const sx = Math.sin(Math.PI * u), sy = Math.sin(Math.PI * v);
  const x = (u - .5) * .45 * (1 - .055 * sy) * Math.sqrt(1 - .10 * (2 * v - 1) ** 6);
  const y = (v - .5) * .43 * (1 - .045 * sx) * Math.sqrt(1 - .10 * (2 * u - 1) ** 6) - .010 * sx ** 14 * (v > .5 ? 1 : -1);
  const puff = .083 * Math.pow(Math.max(0, sx * sy), .55);
  const creases = .0035 * Math.sin(u * 48 + v * 27) * Math.exp(-Math.min(u, 1 - u, v, 1 - v) * 15) * sx * sy;
  return new THREE.Vector3(x, y, side * (.006 + puff + creases));
}

export function pillowGeometry() {
  const segments = 40, stride = segments + 1, sideSize = stride * stride;
  const positions = [], uvs = [], indices = [];
  for (const side of [1, -1]) for (let row = 0; row <= segments; row++) for (let column = 0; column <= segments; column++) {
    const u = column / segments, v = row / segments;
    positions.push(...pillowPoint(u, v, side));
    uvs.push(...pillowFabricUV(side === 1 ? u : 1 - u, v));
  }
  for (let side = 0; side < 2; side++) for (let row = 0; row < segments; row++) for (let column = 0; column < segments; column++) {
    const a = side * sideSize + row * stride + column, b = a + 1, c = a + stride, d = c + 1;
    if (side === 0) indices.push(a, b, c, b, d, c); else indices.push(a, c, b, b, c, d);
  }
  const edge = [];
  for (let column = 0; column <= segments; column++) edge.push(column);
  for (let row = 1; row <= segments; row++) edge.push(row * stride + segments);
  for (let column = segments - 1; column >= 0; column--) edge.push(segments * stride + column);
  for (let row = segments - 1; row > 0; row--) edge.push(row * stride);
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i], b = edge[(i + 1) % edge.length];
    indices.push(a, a + sideSize, b, b, a + sideSize, b + sideSize);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return smoothUpholsteryNormals(geometry);
}

// Reference envelope remains .88 × .9 × .92 m, facing +Z. Placed sizes/scales
// continue to be applied by buildObject, independently of this master design.
export function buildCurvedArmchair({color = loungeChairColor, pillow = true} = {}) {
  const group = new THREE.Group(); group.name = 'Reference curved lounge armchair';
  const fabric = new THREE.MeshPhysicalMaterial({color, roughness: .94, metalness: 0, sheen: .4, sheenRoughness: .85, sheenColor: '#91a9af', bumpMap: fabricWeave(), bumpScale: .00075});
  addMesh(group, 'Continuous curved back and low arms', curvedShellGeometry(), fabric);
  const seamMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(color).multiplyScalar(.78), roughness: 1});
  const backSeam = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120 * 2 - 1, end = Math.abs(u), angle = u * 2.20;
    const radius = .052 + .025 * THREE.MathUtils.smoothstep(end, .30, .90);
    const top = .91 - .025 * end * end - .26 * THREE.MathUtils.smoothstep(end, .24, .98), bottom = .325 + .012 * end;
    const phase = Math.PI * .72, y = top - radius + radius * Math.sin(phase), height = (y - bottom) / (top - bottom);
    const padding = radius * Math.cos(phase);
    backSeam.push(new THREE.Vector3(Math.sin(angle) * (.285 + .047 * height + .011 * Math.sin(Math.PI * height) + padding), y,
      -Math.cos(angle) * (.305 + .060 * height + padding) - .022 + .023 * (1 - height)));
  }
  addMesh(group, 'Fine upholstery seam around back and arms', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(backSeam), 144, .0011, 4, false), seamMaterial);
  addMesh(group, 'Shaped upholstered seat cushion', softSeatGeometry(), fabric);
  const seamPoints = seatOutline().getSpacedPoints(128).map(point => new THREE.Vector3(point.x * .98, .375, -point.y));
  addMesh(group, 'Seat cushion perimeter seam', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints, true), 112, .0018, 4, true), seamMaterial);
  const wood = new THREE.MeshStandardMaterial({color: '#28251f', roughness: .56});
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    // The rear seat outline narrows: locate the rear mortises inside that
    // footprint and extend the timber into the upholstered seat frame.
    const top = z < 0 ? new THREE.Vector3(x * .215, .375, -.205) : new THREE.Vector3(x * .278, .34, .281);
    const bottom = z < 0 ? new THREE.Vector3(x * .28, .016, -.30) : new THREE.Vector3(x * .32, .016, .345);
    const direction = top.clone().sub(bottom), midpoint = top.clone().add(bottom).multiplyScalar(.5);
    const legGeometry = new THREE.CylinderGeometry(.029, .018, direction.length(), 4);
    legGeometry.rotateY(Math.PI / 4);
    const leg = addMesh(group, `Tapered timber leg ${x}/${z}`, legGeometry, wood, midpoint.toArray());
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  }
  if (pillow) {
    const cushion = new THREE.Group(); cushion.name = 'Decorative pillow';
    cushion.position.set(-.008, .660, -.145); cushion.rotation.set(-.26, -.025, -.09);
    const print = new THREE.MeshPhysicalMaterial({color: '#ffffff', map: pillowPrint(), roughness: .96, metalness: 0, sheen: .15, bumpMap: fabricWeave(), bumpScale: .0003});
    addMesh(cushion, 'Pillow with clean botanical fabric', pillowGeometry(), print);
    const points = [];
    for (let i = 0; i <= 112; i++) {
      const t = i / 112 * 4, side = Math.min(3, Math.floor(t)), f = t - side;
      const [u, v] = side === 0 ? [f, 0] : side === 1 ? [1, f] : side === 2 ? [1 - f, 1] : [0, 1 - f];
      points.push(pillowPoint(u, v));
    }
    const piping = new THREE.MeshStandardMaterial({color: '#657b87', roughness: 1});
    addMesh(cushion, 'Pillow edge piping', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 112, .0015, 4, true), piping);
    group.add(cushion);
  }
  const bounds = new THREE.Box3().setFromObject(group), size = bounds.getSize(new THREE.Vector3());
  group.scale.set(.88 / size.x, .9 / size.y, .92 / size.z);
  group.position.y = -bounds.min.y * group.scale.y;
  return group;
}
