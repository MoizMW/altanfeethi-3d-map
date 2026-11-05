import {readdir, readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const categories = ['Seating', 'Tables & consoles', 'Decor & fixtures', 'Reception & equipment'];
const designFields = ['type', 'variant', 'shape', 'mount', 'flagDesign', 'serviceStyle'];
const appearanceFields = ['size', 'scale', 'color', 'shellColor', 'cushionColor', 'pillow', 'accessories', 'workstations',
  'openFraction', 'leafCount', 'hingeSide', 'omitLeftPartition', 'omitRightPartition', 'beltClosed', 'screenScale', 'constructionCover', 'frameStyle', 'detailLevel'];
const select = (object, fields) => Object.fromEntries(fields.filter(key => object[key] !== undefined).map(key => [key, object[key]]));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const title = value => value === 'tv' ? 'TV' : value.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

export function objectDesign(object) {
  return {type: object.type, variant: object.variant || 'default', ...select(object, designFields.slice(2))};
}

export function categoryFor(type) {
  if (['armchair', 'sofa', 'office-chair', 'privacy-pod'].includes(type)) return 'Seating';
  if (['table', 'display-console'].includes(type)) return 'Tables & consoles';
  if (['plant', 'floor-lamp', 'screen', 'display', 'tissue-box', 'tv', 'wall-panel'].includes(type)) return 'Decor & fixtures';
  return 'Reception & equipment';
}

export async function collectObjectLibrary(root = projectRoot) {
  const groups = new Map(), blocks = [];
  for (const floor of ['ground', 'first']) {
    const directories = (await readdir(resolve(root, 'blocks', floor), {withFileTypes: true}))
      .filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
    for (const directory of directories) {
      const block = `${floor}/${directory.name}`, base = resolve(root, 'blocks', block);
      if ((await readdir(base)).every(name => name === 'backups')) continue;
      const [manifest, file] = await Promise.all(['manifest.json', 'objects.json']
        .map(async name => JSON.parse(await readFile(resolve(base, name), 'utf8'))));
      blocks.push({key: block, name: manifest.name, count: file.objects.length});
      for (const object of file.objects) {
        const design = objectDesign(object), key = JSON.stringify(design);
        if (!groups.has(key)) {
          const suffix = designFields.filter(field => field !== 'type' && design[field] && design[field] !== 'default')
            .map(field => title(design[field]));
          groups.set(key, {id: `${object.type}-${hash(design)}`, name: [title(object.type), ...suffix].join(' · '),
            category: categoryFor(object.type), design, count: 0, configurations: new Map()});
        }
        const asset = groups.get(key), appearance = select(object, appearanceFields);
        // The existing portrait builder chooses artwork from the physical ID.
        // Preserve that visual difference without grouping every physical ID separately.
        if (object.variant === 'reception-portrait') appearance.portraitIndex = object.id.match(/portrait-([123])$/)?.[1] || '1';
        const appearanceKey = JSON.stringify(appearance);
        if (!asset.configurations.has(appearanceKey)) {
          asset.configurations.set(appearanceKey, {id: hash({...design, ...appearance}), appearance,
            preview: {...design, ...appearance, id: object.id, name: asset.name, position: [0, 0, 0], yaw: 0, seats: [], cameras: []}, usages: []});
        }
        asset.count++;
        asset.configurations.get(appearanceKey).usages.push({block, objectId: object.id, name: object.name,
          seats: object.seats || [], cameras: object.cameras || []});
      }
    }
  }
  const assets = [...groups.values()].map(asset => ({...asset, configurations: [...asset.configurations.values()]}))
    .sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category) || a.name.localeCompare(b.name));
  return {format: 'altanfeethi-object-library', version: 1, scope: 'Saved ground and first-floor block objects; excludes architecture and composed layout copies.',
    totals: {blocks: blocks.length, designs: assets.length, configurations: assets.reduce((n, a) => n + a.configurations.length, 0),
      placements: assets.reduce((n, a) => n + a.count, 0)}, blocks, assets};
}

export async function saveObjectLibrary(root = projectRoot) {
  const library = await collectObjectLibrary(root), destination = resolve(root, 'shared/assets/library');
  await mkdir(destination, {recursive: true});
  await writeFile(resolve(destination, 'inventory.json'), JSON.stringify(library, null, 2) + '\n');
  return library;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const library = await saveObjectLibrary();
  console.log(`Saved ${library.totals.designs} designs, ${library.totals.configurations} configurations and ${library.totals.placements} placements to shared/assets/library/inventory.json`);
}
