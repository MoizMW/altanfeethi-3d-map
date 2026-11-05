import * as THREE from 'three';

// One texture scale for every block, polygon and rotated floor section (metres).
export const stoneTextureSpan = 4.8;
export const floorFinishes = {
  'dark-stone-floor': {color:'#b7b5b2', fallback:'#48443f', roughness:.24, reflection:1},
  'pale-stone-floor': {color:'#f0f0ed', fallback:'#d7d4c9', roughness:.32, reflection:.6},
};
const textures = new Map();
export const floorReflection = {
  map: {value:null}, matrix: {value:new THREE.Matrix4()}, ready: {value:0},
};

export function floorFinishForColor(color='#424747') {
  const c = new THREE.Color(color);
  return c.r*.2126+c.g*.7152+c.b*.0722 > .35 ? 'pale-stone-floor' : 'dark-stone-floor';
}

function stoneTexture(id) {
  if (typeof document === 'undefined') return null;
  if (!textures.has(id)) {
    const texture = new THREE.TextureLoader().load(`/shared/materials/textures/${id}/basecolor.png`);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1/stoneTextureSpan,1/stoneTextureSpan);
    texture.anisotropy = 8;
    textures.set(id,texture);
  }
  return textures.get(id);
}

// Bake planar, world-metre UVs rather than stretching a single image over a room.
export function setFloorUV(mesh) {
  mesh.updateWorldMatrix(true,false);
  const position = mesh.geometry.attributes.position, uv = new Float32Array(position.count*2);
  const point = new THREE.Vector3();
  for (let i=0;i<position.count;i++) {
    point.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);
    uv[i*2]=point.x; uv[i*2+1]=point.z;
  }
  mesh.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  return mesh;
}

export function createFloorMaterial(color='#424747',{joints=true}={}) {
  const id = floorFinishForColor(color), finish = floorFinishes[id], map = stoneTexture(id);
  const material = new THREE.MeshPhysicalMaterial({
    name:id, color:map?finish.color:finish.fallback, map, roughness:finish.roughness,
    metalness:0, clearcoat:.18, clearcoatRoughness:.28, side:THREE.DoubleSide,
  });
  material.userData.floorFinish=id;
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms,{
      stoneReflection:floorReflection.map, stoneReflectionMatrix:floorReflection.matrix,
      stoneReflectionReady:floorReflection.ready,
      stonePolish:{value:finish.reflection}, stoneJoints:{value:joints?1:0},
    });
    shader.vertexShader = `varying vec3 vStoneWorld;\n${shader.vertexShader}`.replace(
      '#include <begin_vertex>', '#include <begin_vertex>\nvStoneWorld = (modelMatrix * vec4(transformed,1.0)).xyz;');
    shader.fragmentShader = `
      varying vec3 vStoneWorld;
      uniform sampler2D stoneReflection;
      uniform mat4 stoneReflectionMatrix;
      uniform float stoneReflectionReady, stonePolish, stoneJoints;
      ${shader.fragmentShader}`.replace('#include <color_fragment>',`
        #include <color_fragment>
        // Sub-millimetre, low contrast joints disappear at map scale.
        vec2 stoneCell = abs(fract(vStoneWorld.xz / .6 + .5) - .5) * .6;
        float stonePixel = max(fwidth(vStoneWorld.x), fwidth(vStoneWorld.z));
        float stoneJoint = (1.0 - smoothstep(.0004, .0004 + stonePixel, min(stoneCell.x,stoneCell.y)))
          * min(1.0,.002/max(stonePixel,.00001)) * stoneJoints;
        diffuseColor.rgb *= 1.0 - .065 * stoneJoint;
      `).replace('#include <opaque_fragment>',`
        vec4 stoneProjected = stoneReflectionMatrix * vec4(vStoneWorld,1.0);
        vec2 stoneScreen = stoneProjected.xy / stoneProjected.w;
        if (stoneReflectionReady > .5 && stoneProjected.w > 0.0 &&
            all(greaterThanEqual(stoneScreen,vec2(0.0))) && all(lessThanEqual(stoneScreen,vec2(1.0)))) {
          vec3 stoneReflected = texture2D(stoneReflection,stoneScreen,2.0).rgb;
          vec3 stoneView = normalize(cameraPosition-vStoneWorld);
          float stoneFresnel = pow(1.0-abs(stoneView.y),5.0);
          outgoingLight = mix(outgoingLight,stoneReflected,(.10+.25*stoneFresnel)*stonePolish);
        }
        #include <opaque_fragment>
      `);
  };
  material.customProgramCacheKey=()=>`stone-floor-v1-${id}-${joints}`;
  return material;
}
