import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {buildObject} from './object-builders.js';

const $ = id => document.getElementById(id);
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
let library, activeCategory = 'All designs', selectedAsset, currentModel, detailView, thumbnailView, generation = 0;
const thumbnails = new Map();
const sizeText = config => config.appearance.size.map((value, i) => +(value * (config.appearance.scale?.[i] ?? 1)).toFixed(3)).join(' × ') + ' m';
const configText = (config, i) => `${i + 1}. ${config.appearance.color} · ${sizeText(config)}${config.appearance.portraitIndex ? ` · Portrait ${config.appearance.portraitIndex}` : ''} · ${config.usages.length} placed`;
const allUsages = asset => asset.configurations.flatMap(config => config.usages);
const rooms = asset => new Set(allUsages(asset).map(usage => usage.block));

function makeView(canvasParent, width, height) {
  const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.setSize(width, height);
  renderer.setPixelRatio(canvasParent ? Math.min(devicePixelRatio, 2) : 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (canvasParent) canvasParent.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ebeee6');
  scene.add(new THREE.HemisphereLight('#fff7e6', '#66706b', 2.3));
  const light = new THREE.DirectionalLight('#fff5df', 3.3);
  light.position.set(3, 8, 5); light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -.0004;
  scene.add(light);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({color: '#ebeee6', roughness: .85}));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.015; floor.receiveShadow = true; scene.add(floor);
  const camera = new THREE.PerspectiveCamera(36, width / height, .01, 1000);
  const controls = canvasParent ? new OrbitControls(camera, renderer.domElement) : null;
  if (controls) { controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - .02; }
  return {renderer, scene, camera, controls, light};
}

function disposeModel(model) {
  if (!model) return;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  model.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    for (const material of node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  model.removeFromParent();
  for (const resource of [...geometries, ...materials, ...textures]) if (!resource.userData?.shared) resource.dispose();
}

function frame(view, model) {
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model), center = bounds.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
  model.updateMatrixWorld(true);
  bounds.setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3()), target = bounds.getCenter(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, .15);
  const fov = Math.min(THREE.MathUtils.degToRad(view.camera.fov), 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(view.camera.fov) / 2) * view.camera.aspect));
  const distance = radius / Math.sin(fov / 2) * 1.12;
  view.camera.position.copy(target).add(new THREE.Vector3(1, .72, 1.25).normalize().multiplyScalar(distance));
  view.camera.near = Math.max(.001, distance / 1000); view.camera.far = distance * 100;
  view.camera.updateProjectionMatrix(); view.camera.lookAt(target);
  view.light.position.copy(target).add(new THREE.Vector3(3, 8, 5).normalize().multiplyScalar(radius * 5));
  view.light.target.position.copy(target); view.scene.add(view.light.target);
  const span = radius * 1.7;
  Object.assign(view.light.shadow.camera, {left: -span, right: span, top: span, bottom: -span, near: .01, far: radius * 15});
  view.light.shadow.camera.updateProjectionMatrix();
  if (view.controls) {
    view.controls.target.copy(target); view.controls.minDistance = radius * .6; view.controls.maxDistance = distance * 4; view.controls.update();
  }
}

// Thumbnails share one renderer, rather than allocating a WebGL context per card.
const textureWaiters = new Set();
THREE.DefaultLoadingManager.onLoad = () => { for (const resolve of textureWaiters) resolve(); textureWaiters.clear(); };
async function waitForTextures(model) {
  let pending = false;
  model.traverse(node => { if (node.material?.map && !node.material.map.image) pending = true; });
  if (!pending) return;
  await new Promise(resolve => {
    const finish = () => { clearTimeout(timer); textureWaiters.delete(finish); resolve(); };
    const timer = setTimeout(finish, 8000); textureWaiters.add(finish);
  });
}

function createCard(asset, index) {
  const button = element('button', undefined, 'card');
  button.type = 'button'; button.setAttribute('aria-label', `Inspect ${asset.name}`);
  const thumbnail = element('div', undefined, 'thumbnail');
  const image = element('img'); image.alt = `${asset.name} 3D preview`; image.hidden = true;
  thumbnail.append(image, element('span', String(index + 1).padStart(2, '0'), 'number'), element('span', 'Inspect in 3D ↗', 'inspect'));
  const info = element('div', undefined, 'card-info'); info.append(element('span', asset.category, 'card-category'), element('h3', asset.name));
  const meta = element('div', undefined, 'card-meta');
  meta.append(element('span', `${asset.count} placed · ${rooms(asset).size} spaces`), element('span', `${asset.configurations.length} configurations`));
  const swatches = element('div', undefined, 'swatches');
  const colors = [...new Set(asset.configurations.map(config => config.appearance.color))];
  for (const color of colors.slice(0, 7)) {
    const swatch = element('span', undefined, 'swatch'); swatch.style.setProperty('--swatch', color); swatch.title = color; swatches.append(swatch);
  }
  if (colors.length > 7) swatches.append(element('small', `+${colors.length - 7}`));
  info.append(meta, swatches); button.append(thumbnail, info); button.onclick = () => openAsset(asset);
  return {button, image, asset};
}

async function renderThumbnails(cards, token) {
  if (!thumbnailView) thumbnailView = makeView(null, 480, 370);
  for (const {asset, image} of cards) {
    if (token !== generation) return;
    try {
      if (!thumbnails.has(asset.id)) {
        const model = buildObject(asset.configurations[0].preview);
        try {
          thumbnailView.scene.add(model); frame(thumbnailView, model); await waitForTextures(model);
          thumbnailView.renderer.render(thumbnailView.scene, thumbnailView.camera);
          thumbnails.set(asset.id, thumbnailView.renderer.domElement.toDataURL('image/png'));
        } finally { disposeModel(model); }
      }
      if (token !== generation) return;
      image.src = thumbnails.get(asset.id); image.hidden = false;
    } catch (error) { image.parentElement.append(element('span', 'Open to inspect')); console.error(asset.name, error); }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

function filter() {
  if (!library) return;
  const query = $('search').value.toLowerCase().trim(), block = $('block').value;
  const assets = library.assets.filter(asset => (activeCategory === 'All designs' || asset.category === activeCategory)
    && (!block || rooms(asset).has(block)) && (!query || [asset.name, asset.category, JSON.stringify(asset.configurations)].join(' ').toLowerCase().includes(query)));
  $('collection-title').textContent = activeCategory;
  $('result-count').textContent = `${assets.length} of ${library.totals.designs} designs`;
  $('empty').hidden = assets.length > 0;
  const cards = assets.map(createCard); $('grid').replaceChildren(...cards.map(card => card.button));
  // Chain generations so a texture-loading thumbnail cannot overlap the next batch.
  const token = ++generation;
  thumbnailQueue = thumbnailQueue.catch(() => {}).then(() => renderThumbnails(cards, token)).catch(error => {
    $('result-count').textContent = `3D preview unavailable: ${error.message}`;
  });
}
let thumbnailQueue = Promise.resolve();

function updateConfiguration() {
  const config = selectedAsset.configurations[Number($('configuration').value) || 0];
  disposeModel(currentModel); currentModel = null;
  currentModel = buildObject(config.preview); detailView.scene.add(currentModel); frame(detailView, currentModel);
  const pillow = currentModel.getObjectByName('Decorative pillow');
  $('pillow-option').hidden = !pillow;
  $('show-pillow').checked = true;
  const appearance = config.appearance;
  const specifications = [['Dimensions', sizeText(config)], ['Base color', appearance.color], ['Shell color', appearance.shellColor],
    ['Variant', selectedAsset.design.variant], ['Shape', selectedAsset.design.shape], ['Mount', selectedAsset.design.mount],
    ['Options', Object.entries(appearance).filter(([key]) => !['size', 'scale', 'color', 'shellColor'].includes(key)).map(([key, value]) => `${key}: ${value}`).join(' · ')],
    ['Scale', 'Provisional meters; dimensions are estimates.']];
  $('specifications').replaceChildren(...specifications.filter(([, value]) => value).flatMap(([key, value]) => [element('dt', key), element('dd', value)]));
  $('usages').replaceChildren(...config.usages.map(usage => {
    const item = element('li'), link = element('a', `${usage.block} ↗`);
    const query = new URLSearchParams({block: usage.block, object: usage.objectId});
    link.href = `/?${query}`; link.target = '_blank'; link.rel = 'noopener';
    item.append(link, element('small', usage.name), element('small', [usage.objectId, usage.seats.join(' / ')].filter(Boolean).join(' · ')));
    return item;
  }));
}

function resizeDetail() {
  if (!detailView || !$('detail').open) return;
  const width = $('model').clientWidth, height = $('model').clientHeight;
  detailView.renderer.setSize(width, height); detailView.camera.aspect = width / height; detailView.camera.updateProjectionMatrix();
  if (currentModel) frame(detailView, currentModel);
}

function animateDetail() {
  if (!$('detail').open) return;
  detailView.controls.update(); detailView.renderer.render(detailView.scene, detailView.camera);
  requestAnimationFrame(animateDetail);
}

function openAsset(asset) {
  const wasOpen = $('detail').open;
  selectedAsset = asset;
  $('detail-category').textContent = asset.category; $('detail-title').textContent = asset.name;
  $('detail-summary').textContent = `${asset.count} saved placements across ${rooms(asset).size} spaces. ${asset.configurations.length} size, finish and option configurations.`;
  $('configuration').replaceChildren(...asset.configurations.map((config, i) => {
    const option = element('option', configText(config, i)); option.value = i; return option;
  }));
  if (!wasOpen) $('detail').showModal();
  if (!detailView) detailView = makeView($('model'), $('model').clientWidth, $('model').clientHeight);
  resizeDetail(); updateConfiguration();
  history.replaceState(null, '', `#${asset.id}`);
  if (!wasOpen) requestAnimationFrame(animateDetail);
}

async function load() {
  $('refresh').disabled = true;
  try {
    const response = await fetch('/api/object-library');
    if (!response.ok) throw new Error((await response.json()).error || 'Could not load library');
    library = await response.json(); thumbnails.clear();
    const totals = library.totals;
    $('stats').replaceChildren(...[['designs', 'Unique designs'], ['configurations', 'Configurations'], ['placements', 'Placements'], ['blocks', 'Spaces']].map(([key, label]) => {
      const stat = element('div', undefined, 'stat'); stat.append(element('strong', totals[key]), element('span', label)); return stat;
    }));
    const blockValue = $('block').value;
    $('block').replaceChildren(element('option', 'All locations'), ...library.blocks.map(block => {
      const option = element('option', block.name); option.value = block.key; return option;
    })); $('block').options[0].value = ''; $('block').value = blockValue;
    $('categories').replaceChildren(...['All designs', ...new Set(library.assets.map(asset => asset.category))].map(category => {
      const count = category === 'All designs' ? library.assets.length : library.assets.filter(asset => asset.category === category).length;
      const button = element('button', category, category === activeCategory ? 'active' : ''); button.append(element('small', count));
      button.onclick = () => {
        activeCategory = category; for (const sibling of $('categories').children) sibling.classList.toggle('active', sibling === button); filter();
      }; return button;
    }));
    filter();
    const linked = library.assets.find(asset => asset.id === location.hash.slice(1)); if (linked) openAsset(linked);
  } catch (error) { $('result-count').textContent = error.message; }
  finally { $('refresh').disabled = false; }
}

$('search').addEventListener('input', filter); $('block').addEventListener('change', filter);
$('refresh').onclick = load; $('configuration').onchange = updateConfiguration;
$('close').onclick = () => $('detail').close();
$('detail').addEventListener('close', () => { disposeModel(currentModel); currentModel = null; history.replaceState(null, '', location.pathname); });
$('detail').addEventListener('click', event => { if (event.target === $('detail')) $('detail').close(); });
$('reset-view').onclick = () => { if (currentModel) frame(detailView, currentModel); };
$('show-pillow').onchange = () => {
  const pillow = currentModel?.getObjectByName('Decorative pillow');
  if (pillow) pillow.visible = $('show-pillow').checked;
};
new ResizeObserver(resizeDetail).observe($('model'));
$('download').onclick = () => {
  if (!library) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(library, null, 2) + '\n'], {type: 'application/json'}));
  const link = element('a'); link.href = url; link.download = 'altanfeethi-object-library.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
load();
