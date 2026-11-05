import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {fabricWeave, smoothUpholsteryNormals, pillowGeometry, pillowPoint} from './curved-armchair.js';

export const loungeSofaColor = '#aaa59c';
export const sofaPillowColor = '#708e9b';

let linenTexture;
function linenTone() {
  if (linenTexture) return linenTexture;
  const size = 128, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fiber = Math.sin(x * Math.PI / 2) * 3 + Math.sin(y * Math.PI / 2) * 2;
    const slub = ((x * 47 + y * 83 + x * y * 7) % 9) - 4;
    const tone = Math.min(255, Math.max(235, 247 + fiber + slub));
    pixels.set([tone, tone, tone, 255], (y * size + x) * 4);
  }
  linenTexture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  linenTexture.colorSpace = THREE.SRGBColorSpace;
  linenTexture.wrapS = linenTexture.wrapT = THREE.RepeatWrapping;
  linenTexture.magFilter = THREE.LinearFilter; linenTexture.minFilter = THREE.LinearMipmapLinearFilter;
  linenTexture.generateMipmaps = true; linenTexture.needsUpdate = true; linenTexture.userData.shared = true;
  return linenTexture;
}

function paddedGeometry(size, radius, puff = .008) {
  const geometry = new RoundedBoxGeometry(...size, 8, radius), positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const sx = Math.max(0, 1 - (x / (size[0] / 2)) ** 4), sy = Math.max(0, 1 - (y / (size[1] / 2)) ** 4);
    const sz = Math.max(0, 1 - (z / (size[2] / 2)) ** 4);
    positions.setXYZ(i, x, y + Math.sign(y) * puff * sx * sz, z + Math.sign(z) * puff * sx * sy);
  }
  const uv = geometry.attributes.uv;
  // Physical weave scale stays small on the long sofa and on individual cushions.
  for (let i = 0; i < uv.count; i++) uv.setXY(i, positions.getX(i) * 12 + positions.getZ(i) * 12, positions.getY(i) * 12 + positions.getZ(i) * 12);
  return smoothUpholsteryNormals(geometry);
}

export function buildLoungeSofa({color = loungeSofaColor, pillow = true} = {}) {
  const group = new THREE.Group(); group.name = 'Woven off-white lounge sofa';
  const cloth = new THREE.MeshPhysicalMaterial({color, metalness: 0, roughness: .95,
    sheen: .28, sheenRoughness: .88, sheenColor: '#e5dfd4', map: linenTone(), bumpMap: fabricWeave(), bumpScale: .0008});
  const seam = new THREE.MeshStandardMaterial({color: new THREE.Color(color).multiplyScalar(.78), roughness: 1});
  const add = (name, geometry, material, position) => {
    const part = new THREE.Mesh(geometry, material); part.name = name;
    part.position.fromArray(position); part.castShadow = part.receiveShadow = true; group.add(part); return part;
  };
  const pad = (name, size, position, radius, puff) => add(name, paddedGeometry(size, radius, puff), cloth, position);
  pad('Upholstered lower frame', [2.01, .17, .84], [0, .205, 0], .045, .004);
  pad('Upholstered rear frame', [1.86, .58, .15], [0, .565, -.355], .045, .006);
  for (const sign of [-1, 1]) {
    const arm = pad(`Soft arm ${sign}`, [.18, .43, .82], [sign * .935, .46, .015], .055, .008);
    arm.rotation.z = -sign * .025;
    const seat = pad(`Seat cushion ${sign}`, [.827, .16, .65], [sign * .418, .365, .09], .045, .008);
    const back = pad(`Full back cushion ${sign}`, [.835, .415, .155], [sign * .422, .645, -.245], .04, .013);
    back.rotation.x = -.14;
    // Fine upholstery piping around the cushion face, including the center split.
    for (const [part, width, height, depth, name] of [[seat, .827, .16, .65, 'Seat seam'], [back, .835, .415, .155, 'Back cushion seam']]) {
      const points = [], rounded = .035;
      const shape = new THREE.Shape(); const w = width / 2 - .008, h = height / 2 - .008;
      shape.moveTo(-w + rounded, -h); shape.lineTo(w - rounded, -h);
      shape.quadraticCurveTo(w, -h, w, -h + rounded); shape.lineTo(w, h - rounded);
      shape.quadraticCurveTo(w, h, w - rounded, h); shape.lineTo(-w + rounded, h);
      shape.quadraticCurveTo(-w, h, -w, h - rounded); shape.lineTo(-w, -h + rounded);
      shape.quadraticCurveTo(-w, -h, -w + rounded, -h);
      for (const p of shape.getSpacedPoints(112)) points.push(new THREE.Vector3(p.x, p.y, depth / 2 - .009));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 112, .0014, 4, true), seam);
      mesh.name = `${name} ${sign}`; part.add(mesh);
    }
  }
  const timber = new THREE.MeshStandardMaterial({color: '#292820', roughness: .55});
  for (const x of [-.84, .84]) for (const z of [-.30, .30]) {
    const leg = add(`Connected sofa foot ${x}/${z}`, new THREE.CylinderGeometry(.028, .021, .15, 4), timber, [x, .075, z]);
    leg.rotation.y = Math.PI / 4;
  }
  if (pillow) {
    const pillows = new THREE.Group(); pillows.name = 'Decorative pillow';
    const blue = new THREE.MeshPhysicalMaterial({color: sofaPillowColor, roughness: .91, metalness: 0,
      sheen: .3, sheenRoughness: .8, bumpMap: fabricWeave(), bumpScale: .0004});
    const edge = new THREE.MeshStandardMaterial({color: '#293c47', roughness: .95});
    for (const sign of [-1, 1]) {
      const cushion = new THREE.Group(); cushion.name = `Light blue piped pillow ${sign}`;
      cushion.position.set(sign * .49, .637, -.075); cushion.rotation.set(-.22, sign * -.04, sign * -.17);
      const face = new THREE.Mesh(pillowGeometry(), blue); face.name = 'Plain light blue woven fabric';
      face.castShadow = face.receiveShadow = true; cushion.add(face);
      const points = [];
      for (let i = 0; i <= 160; i++) {
        const t = i / 160 * 4, side = Math.min(3, Math.floor(t)), f = t - side;
        const [u, v] = side === 0 ? [f, 0] : side === 1 ? [1, f] : side === 2 ? [1 - f, 1] : [0, 1 - f];
        points.push(pillowPoint(u, v));
      }
      const piping = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 160, .003, 6, true), edge);
      piping.name = 'Dark contrast pillow piping'; cushion.add(piping); pillows.add(cushion);
    }
    group.add(pillows);
  }
  const bounds = new THREE.Box3().setFromObject(group), size = bounds.getSize(new THREE.Vector3());
  group.scale.set(2.05 / size.x, .88 / size.y, .9 / size.z); group.position.y = -bounds.min.y * group.scale.y;
  return group;
}
