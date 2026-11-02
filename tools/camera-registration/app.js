const floorConfig = {
  ground: {
    label: "Ground floor",
    src: "map/ground-floor.png",
    filename: "ground-floor.png",
    width: 14761,
    height: 8610,
  },
  first: {
    label: "First floor",
    src: "map/first-floor.png",
    filename: "first-floor.png",
    width: 7076,
    height: 4086,
  },
};

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
const cameraFiles = [
  ...range(1, 14).map((number) => `B${number}.jpg`),
  ...[1, 2, 3, 8, ...range(10, 18), ...range(21, 27)].map((number) => `C${number}.jpg`),
  "D2.jpg",
  "Cor1.jpg",
  "Cor2.jpg",
  ...[1, 2, 3, 4, 5, 6, 8, 11, 13, 14].map((number) => `E${number}.jpg`),
  ...range(1, 18).map((number) => `F${number}.jpg`),
  "F15S.jpg",
  ...[1, 2, ...range(4, 29)].map((number) => `G${number}.jpg`),
  ...[...range(1, 9), ...range(11, 41), ...range(43, 56)].map((number) => `H${number}.jpg`),
  ...[...range(13, 18), 22, ...range(24, 35), 37, ...range(39, 48)].map((number) => `I${number}.jpg`),
  "ENTRANCE.jpg",
  "EXIT.jpg",
  "Egate1.jpg",
  ...range(1, 3).map((number) => `ReceptionCam${number}.jpg`),
  ...range(1, 4).map((number) => `SGSCam${number}.jpg`),
];

const cameraGroups = window.ALTANFEETHI_CAMERA_GROUPS || {};
const defaultZoneForCamera = (cameraId) => cameraId.match(/[A-Za-z]/)?.[0]?.toUpperCase() || "";

const makeCamera = (file) => ({
  id: file.replace(/\.jpg$/i, ""),
  file,
  zone: /^Cor\d+\.jpg$/i.test(file) ? "" : defaultZoneForCamera(file),
  group_id: cameraGroups[file.replace(/\.jpg$/i, "")] || "",
  floor: null,
  position: null,
  heading: 0,
  status: "unplaced",
  notes: "",
  provenance: null,
});

const initialState = {
  format: "altanfeethi-camera-registration",
  version: 1,
  coordinateSpace: "source-image-pixels",
  updatedAt: new Date().toISOString(),
  floors: floorConfig,
  cameras: cameraFiles.map(makeCamera),
};

const b1 = initialState.cameras.find((camera) => camera.id === "B1");
Object.assign(b1, {
  floor: "ground",
  position: { x: 4190, y: 4057 },
  heading: 0,
  status: "approximate",
  notes: "Transferred from the overlapping camera-marking screenshots. Exact physical mount point and heading still require confirmation.",
  provenance: {
    type: "registered-reference",
    sources: ["camera_marking/image (1).png", "camera_marking/image (2).png"],
    confidence: "medium",
  },
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const readSavedState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("altanfeethi-camera-registration"));
    if (saved?.format !== initialState.format || !Array.isArray(saved.cameras)) return clone(initialState);
    const savedById = new Map(saved.cameras.map((camera) => [camera.id, camera]));
    const merged = clone(initialState);
    merged.cameras = merged.cameras.map((camera) => ({ ...camera, ...(savedById.get(camera.id) || {}) }));
    return merged;
  } catch {
    return clone(initialState);
  }
};

let state = readSavedState();
let selectedCameraId = "B1";
let activeFloor = "ground";
let statusFilter = "all";
let placementMode = false;
let toastTimeout;

const canvas = document.querySelector("#map-canvas");
const canvasWrap = document.querySelector("#canvas-wrap");
const context = canvas.getContext("2d");
const mapImages = {};
const viewByFloor = {
  ground: { scale: 1, offsetX: 0, offsetY: 0, fitted: false },
  first: { scale: 1, offsetX: 0, offsetY: 0, fitted: false },
};

let dragState = null;

const elements = {
  list: document.querySelector("#camera-list"),
  search: document.querySelector("#camera-search"),
  filteredCount: document.querySelector("#filtered-count"),
  cameraCount: document.querySelector("#camera-count"),
  placedCount: document.querySelector("#placed-count"),
  groundCount: document.querySelector("#ground-floor-count"),
  firstCount: document.querySelector("#first-floor-count"),
  selectedTitle: document.querySelector("#selected-camera-title"),
  selectedBadge: document.querySelector("#selected-status-badge"),
  snapshot: document.querySelector("#snapshot-image"),
  snapshotCaption: document.querySelector("#snapshot-caption"),
  positionX: document.querySelector("#position-x"),
  positionY: document.querySelector("#position-y"),
  coordinateNote: document.querySelector("#coordinate-note"),
  floor: document.querySelector("#camera-floor"),
  headingRange: document.querySelector("#heading-range"),
  headingValue: document.querySelector("#heading-value"),
  zone: document.querySelector("#camera-zone"),
  group: document.querySelector("#camera-group"),
  notes: document.querySelector("#camera-notes"),
  evidenceCard: document.querySelector("#evidence-card"),
  mapLoading: document.querySelector("#map-loading"),
  zoomLabel: document.querySelector("#zoom-label"),
  placementBanner: document.querySelector("#placement-banner"),
  placementCamera: document.querySelector("#placement-camera"),
  toast: document.querySelector("#toast"),
  saveButton: document.querySelector("#save-json-button"),
  mapSourceName: document.querySelector("#map-source-name"),
  mapInfoTitle: document.querySelector("#map-info-title"),
  saveSetupDialog: document.querySelector("#save-setup-dialog"),
  saveSetupNote: document.querySelector("#save-setup-note"),
};

const getSelectedCamera = () => state.cameras.find((camera) => camera.id === selectedCameraId);

const naturalSort = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
state.cameras.sort((a, b) => naturalSort.compare(a.id, b.id));

function saveState(touchUpdatedAt = true) {
  if (touchUpdatedAt) state.updatedAt = new Date().toISOString();
  localStorage.setItem("altanfeethi-camera-registration", JSON.stringify(state));
}

function showToast(message) {
  clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimeout = setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function cameraSubtitle(camera) {
  if (!camera.position) return "Not positioned";
  return `${floorConfig[camera.floor]?.label || "Unknown floor"} · ${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}`;
}

function filteredCameras() {
  const term = elements.search.value.trim().toLowerCase();
  return state.cameras.filter((camera) => {
    const searchMatch = !term
      || camera.id.toLowerCase().includes(term)
      || camera.file.toLowerCase().includes(term)
      || (camera.zone || "").toLowerCase().includes(term)
      || (camera.group_id || "").toLowerCase().includes(term);
    const placed = Boolean(camera.position && camera.floor);
    const statusMatch = statusFilter === "all" || (statusFilter === "placed" ? placed : !placed);
    return searchMatch && statusMatch;
  });
}

function renderCameraList() {
  const cameras = filteredCameras();
  elements.filteredCount.textContent = cameras.length;
  elements.list.innerHTML = cameras
    .map(
      (camera) => `
        <button class="camera-item ${camera.id === selectedCameraId ? "is-active" : ""}" data-camera-id="${camera.id}" role="option" aria-selected="${camera.id === selectedCameraId}">
          <span class="camera-avatar"><img loading="lazy" src="camera_snapshot/${camera.file}" alt="" /></span>
          <span class="camera-copy"><strong>${camera.id}</strong><span>${cameraSubtitle(camera)}</span></span>
          <i class="camera-state-dot ${camera.status}" aria-label="${camera.status}"></i>
        </button>`,
    )
    .join("");

  elements.list.querySelectorAll("[data-camera-id]").forEach((button) => {
    button.addEventListener("click", () => selectCamera(button.dataset.cameraId));
  });
}

function updateCounts() {
  const placed = state.cameras.filter((camera) => camera.position && camera.floor);
  elements.cameraCount.textContent = state.cameras.length;
  elements.placedCount.textContent = placed.length;
  elements.groundCount.textContent = placed.filter((camera) => camera.floor === "ground").length;
  elements.firstCount.textContent = placed.filter((camera) => camera.floor === "first").length;
}

function selectCamera(id) {
  selectedCameraId = id;
  const camera = getSelectedCamera();
  if (camera?.floor && camera.floor !== activeFloor) switchFloor(camera.floor);
  renderCameraList();
  renderInspector();
  draw();
}

function renderInspector() {
  const camera = getSelectedCamera();
  if (!camera) return;

  const status = camera.position ? camera.status : "unplaced";
  elements.selectedTitle.textContent = camera.id;
  elements.selectedBadge.textContent = status[0].toUpperCase() + status.slice(1);
  elements.selectedBadge.className = `status-badge ${status}`;
  elements.snapshot.src = `camera_snapshot/${camera.file}`;
  elements.snapshot.alt = `Snapshot from camera ${camera.id}`;
  elements.snapshotCaption.textContent = `camera_snapshot/${camera.file}`;
  elements.positionX.value = camera.position ? Math.round(camera.position.x) : "";
  elements.positionY.value = camera.position ? Math.round(camera.position.y) : "";
  elements.positionX.disabled = !camera.position;
  elements.positionY.disabled = !camera.position;
  elements.floor.value = camera.floor || activeFloor;
  elements.headingRange.value = camera.heading ?? 0;
  elements.headingValue.value = camera.heading ?? 0;
  elements.zone.value = camera.zone || "";
  elements.group.value = camera.group_id || "";
  elements.notes.value = camera.notes || "";
  elements.coordinateNote.textContent = camera.position
    ? `Source-image pixels on the ${floorConfig[camera.floor].label.toLowerCase()} plan.`
    : "Place this camera on a floor plan to create coordinates.";

  document.querySelectorAll("[data-status]").forEach((button) => {
    button.classList.toggle("is-active", camera.position && button.dataset.status === camera.status);
    button.disabled = !camera.position;
  });

  document.querySelector("#place-camera").textContent = camera.position ? "Reposition on map" : "Place on map";
  document.querySelector("#locate-marker").disabled = !camera.position;
  elements.evidenceCard.hidden = !camera.provenance;
}

function updateSelectedCamera(mutator) {
  const camera = getSelectedCamera();
  if (!camera) return;
  mutator(camera);
  saveState();
  updateCounts();
  renderCameraList();
  renderInspector();
  draw();
}

function switchFloor(floor) {
  activeFloor = floor;
  elements.mapSourceName.textContent = floorConfig[floor].filename;
  elements.mapInfoTitle.textContent = floorConfig[floor].src;
  document.querySelectorAll("[data-floor]").forEach((button) => {
    const active = button.dataset.floor === floor;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (!viewByFloor[floor].fitted && mapImages[floor]?.complete) fitMap();
  draw();
}

function loadMaps() {
  Object.entries(floorConfig).forEach(([floor, config]) => {
    const image = new Image();
    image.src = config.src;
    image.onload = () => {
      mapImages[floor] = image;
      if (floor === activeFloor) {
        elements.mapLoading.hidden = true;
        fitMap();
      }
    };
    image.onerror = () => {
      if (floor === activeFloor) elements.mapLoading.textContent = `Could not load ${config.src}`;
    };
  });
}

function resizeCanvas() {
  const bounds = canvasWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
  canvas.height = Math.max(1, Math.floor(bounds.height * dpr));
  canvas.style.width = `${bounds.width}px`;
  canvas.style.height = `${bounds.height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!viewByFloor[activeFloor].fitted) fitMap();
  else draw();
}

function fitMap() {
  const image = mapImages[activeFloor];
  if (!image) return;
  const bounds = canvas.getBoundingClientRect();
  const padding = 34;
  const scale = Math.min((bounds.width - padding * 2) / image.naturalWidth, (bounds.height - padding * 2) / image.naturalHeight);
  const view = viewByFloor[activeFloor];
  view.scale = scale;
  view.offsetX = (bounds.width - image.naturalWidth * scale) / 2;
  view.offsetY = (bounds.height - image.naturalHeight * scale) / 2;
  view.fitted = true;
  draw();
}

function draw() {
  const bounds = canvas.getBoundingClientRect();
  context.clearRect(0, 0, bounds.width, bounds.height);
  const image = mapImages[activeFloor];
  if (!image) return;
  const view = viewByFloor[activeFloor];

  context.save();
  context.imageSmoothingEnabled = true;
  context.drawImage(image, view.offsetX, view.offsetY, image.naturalWidth * view.scale, image.naturalHeight * view.scale);
  context.restore();

  state.cameras
    .filter((camera) => camera.floor === activeFloor && camera.position)
    .forEach((camera) => drawMarker(camera, camera.id === selectedCameraId));

  const fitScale = Math.min((bounds.width - 68) / image.naturalWidth, (bounds.height - 68) / image.naturalHeight);
  elements.zoomLabel.textContent = `${Math.round((view.scale / fitScale) * 100)}%`;
}

function drawMarker(camera, selected) {
  const view = viewByFloor[activeFloor];
  const x = view.offsetX + camera.position.x * view.scale;
  const y = view.offsetY + camera.position.y * view.scale;
  const color = camera.status === "verified" ? "#2bd0b2" : "#f1a734";
  const angle = ((camera.heading ?? 0) - 90) * (Math.PI / 180);
  const arrowLength = selected ? 34 : 25;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = selected ? 3 : 2;
  context.globalAlpha = selected ? 1 : 0.9;

  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + Math.cos(angle) * arrowLength, y + Math.sin(angle) * arrowLength);
  context.stroke();

  const tipX = x + Math.cos(angle) * arrowLength;
  const tipY = y + Math.sin(angle) * arrowLength;
  context.beginPath();
  context.moveTo(tipX, tipY);
  context.lineTo(tipX + Math.cos(angle + 2.55) * 8, tipY + Math.sin(angle + 2.55) * 8);
  context.lineTo(tipX + Math.cos(angle - 2.55) * 8, tipY + Math.sin(angle - 2.55) * 8);
  context.closePath();
  context.fill();

  if (selected) {
    context.globalAlpha = 0.22;
    context.beginPath();
    context.arc(x, y, 16, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }

  context.beginPath();
  context.arc(x, y, selected ? 7 : 5.5, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = "#111821";
  context.stroke();

  context.font = `${selected ? 700 : 650} ${selected ? 12 : 10}px Inter, system-ui, sans-serif`;
  const textWidth = context.measureText(camera.id).width;
  context.fillStyle = "rgba(10,15,21,.88)";
  context.beginPath();
  context.roundRect(x + 10, y - 12, textWidth + 12, 21, 6);
  context.fill();
  context.fillStyle = "#f7fafc";
  context.fillText(camera.id, x + 16, y + 3);
  context.restore();
}

function screenToMap(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const view = viewByFloor[activeFloor];
  return {
    x: (clientX - rect.left - view.offsetX) / view.scale,
    y: (clientY - rect.top - view.offsetY) / view.scale,
  };
}

function mapToScreen(position) {
  const rect = canvas.getBoundingClientRect();
  const view = viewByFloor[activeFloor];
  return {
    x: rect.left + view.offsetX + position.x * view.scale,
    y: rect.top + view.offsetY + position.y * view.scale,
  };
}

function markerAt(clientX, clientY) {
  return state.cameras
    .filter((camera) => camera.floor === activeFloor && camera.position)
    .reverse()
    .find((camera) => {
      const point = mapToScreen(camera.position);
      return Math.hypot(clientX - point.x, clientY - point.y) <= 18;
    });
}

function beginPlacement() {
  const camera = getSelectedCamera();
  camera.floor = elements.floor.value;
  if (activeFloor !== camera.floor) switchFloor(camera.floor);
  placementMode = true;
  canvas.classList.add("is-placing");
  elements.placementBanner.hidden = false;
  elements.placementCamera.textContent = camera.id;
}

function cancelPlacement() {
  placementMode = false;
  canvas.classList.remove("is-placing");
  elements.placementBanner.hidden = true;
}

function placeCameraAt(clientX, clientY) {
  const point = screenToMap(clientX, clientY);
  const config = floorConfig[activeFloor];
  if (point.x < 0 || point.y < 0 || point.x > config.width || point.y > config.height) {
    showToast("Choose a point inside the floor plan image.");
    return;
  }

  updateSelectedCamera((camera) => {
    camera.floor = activeFloor;
    camera.position = { x: Math.round(point.x), y: Math.round(point.y) };
    if (camera.status === "unplaced") camera.status = "approximate";
    if (!camera.notes) camera.notes = "Placed manually; verify against the physical camera mount.";
  });
  cancelPlacement();
  showToast(`${selectedCameraId} positioned on ${floorConfig[activeFloor].label}.`);
}

function zoomAt(factor, clientX, clientY) {
  const view = viewByFloor[activeFloor];
  const image = mapImages[activeFloor];
  if (!image) return;
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const mapX = (x - view.offsetX) / view.scale;
  const mapY = (y - view.offsetY) / view.scale;
  const fitScale = Math.min((rect.width - 68) / image.naturalWidth, (rect.height - 68) / image.naturalHeight);
  const newScale = Math.min(Math.max(view.scale * factor, fitScale * 0.65), fitScale * 18);
  view.offsetX = x - mapX * newScale;
  view.offsetY = y - mapY * newScale;
  view.scale = newScale;
  draw();
}

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomAt(event.deltaY < 0 ? 1.14 : 0.88, event.clientX, event.clientY);
}, { passive: false });

canvas.addEventListener("pointerdown", (event) => {
  if (placementMode) {
    placeCameraAt(event.clientX, event.clientY);
    return;
  }

  const hit = markerAt(event.clientX, event.clientY);
  if (hit) {
    selectCamera(hit.id);
    dragState = { type: "marker", cameraId: hit.id };
  } else {
    const view = viewByFloor[activeFloor];
    dragState = { type: "pan", startX: event.clientX, startY: event.clientY, offsetX: view.offsetX, offsetY: view.offsetY };
  }
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("is-dragging");
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  if (dragState.type === "pan") {
    const view = viewByFloor[activeFloor];
    view.offsetX = dragState.offsetX + event.clientX - dragState.startX;
    view.offsetY = dragState.offsetY + event.clientY - dragState.startY;
  } else {
    const camera = state.cameras.find((item) => item.id === dragState.cameraId);
    const point = screenToMap(event.clientX, event.clientY);
    camera.position = { x: Math.round(point.x), y: Math.round(point.y) };
    elements.positionX.value = camera.position.x;
    elements.positionY.value = camera.position.y;
  }
  draw();
});

canvas.addEventListener("pointerup", (event) => {
  if (dragState?.type === "marker") {
    saveState();
    renderCameraList();
  }
  dragState = null;
  canvas.releasePointerCapture(event.pointerId);
  canvas.classList.remove("is-dragging");
});

function centerOnSelected() {
  const camera = getSelectedCamera();
  if (!camera?.position || !camera.floor) return;
  if (camera.floor !== activeFloor) switchFloor(camera.floor);
  const view = viewByFloor[activeFloor];
  const bounds = canvas.getBoundingClientRect();
  const image = mapImages[activeFloor];
  const fitScale = Math.min((bounds.width - 68) / image.naturalWidth, (bounds.height - 68) / image.naturalHeight);
  view.scale = Math.max(view.scale, fitScale * 4);
  view.offsetX = bounds.width / 2 - camera.position.x * view.scale;
  view.offsetY = bounds.height / 2 - camera.position.y * view.scale;
  draw();
}

function updateCoordinates() {
  const x = Number(elements.positionX.value);
  const y = Number(elements.positionY.value);
  const camera = getSelectedCamera();
  if (!camera?.position || !Number.isFinite(x) || !Number.isFinite(y)) return;
  updateSelectedCamera((item) => { item.position = { x: Math.round(x), y: Math.round(y) }; });
}

function updateHeading(value) {
  const heading = ((Number(value) % 360) + 360) % 360;
  elements.headingRange.value = heading;
  elements.headingValue.value = heading;
  updateSelectedCamera((camera) => { camera.heading = heading; });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJson() {
  const blob = new Blob([`${JSON.stringify(state, null, 2)}\n`], { type: "application/json" });
  downloadBlob(blob, "altanfeethi-camera-placements.json");
  showToast("Camera placement JSON exported.");
}

const handleDatabaseName = "altanfeethi-camera-registration";
const handleStoreName = "filesystem-handles";

function openHandleDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(handleDatabaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(handleStoreName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredProjectHandle() {
  try {
    const database = await openHandleDatabase();
    return await new Promise((resolve, reject) => {
      const request = database.transaction(handleStoreName).objectStore(handleStoreName).get("project-directory");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function storeProjectHandle(handle) {
  const database = await openHandleDatabase();
  await new Promise((resolve, reject) => {
    const request = database.transaction(handleStoreName, "readwrite").objectStore(handleStoreName).put(handle, "project-directory");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getWritableDataDirectory(projectHandle) {
  if (projectHandle.name === "registration") return projectHandle;
  try {
    await projectHandle.getFileHandle("PROJECT_CONTEXT.md");
    const evidenceDirectory = await projectHandle.getDirectoryHandle("evidence");
    return await evidenceDirectory.getDirectoryHandle("registration");
  } catch {
    throw new Error("Choose the altanfeethi-3d-map project folder");
  }
}

async function writeThroughProjectHandle(projectHandle, requestPermission = false) {
  let permission = await projectHandle.queryPermission({ mode: "readwrite" });
  if (permission === "prompt" && requestPermission) permission = await projectHandle.requestPermission({ mode: "readwrite" });
  if (permission !== "granted") return false;

  const dataDirectory = await getWritableDataDirectory(projectHandle);
  const placementHandle = await dataDirectory.getFileHandle("camera-placements.json", { create: true });
  const writable = await placementHandle.createWritable();
  await writable.write(`${JSON.stringify(state, null, 2)}\n`);
  await writable.close();
  return true;
}

function resetSaveButton() {
  elements.saveButton.classList.remove("is-saving");
  elements.saveButton.disabled = false;
  elements.saveButton.textContent = "Save JSON";
}

function finishSave(message) {
  saveState(false);
  elements.saveButton.classList.remove("is-saving");
  elements.saveButton.classList.add("is-saved");
  elements.saveButton.disabled = false;
  elements.saveButton.textContent = "Saved";
  showToast(message);
  setTimeout(() => {
    elements.saveButton.classList.remove("is-saved");
    elements.saveButton.textContent = "Save JSON";
  }, 1800);
}

function showSaveSetup(message = "") {
  elements.saveSetupNote.textContent = message;
  if (!elements.saveSetupDialog.open) elements.saveSetupDialog.showModal();
}

async function saveJsonToWorkspace() {
  elements.saveButton.disabled = true;
  elements.saveButton.classList.add("is-saving");
  elements.saveButton.textContent = "Saving…";
  state.updatedAt = new Date().toISOString();
  saveState(false);

  try {
    const response = await fetch("/api/placements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state, null, 2),
    });
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Save failed");
    finishSave("Saved directly to evidence/registration/camera-placements.json");
  } catch (error) {
    const storedHandle = await getStoredProjectHandle();
    try {
      if (storedHandle && await writeThroughProjectHandle(storedHandle, true)) {
        finishSave("Saved directly to evidence/registration/camera-placements.json");
        return;
      }
    } catch {
      // The stored folder moved or no longer contains the project; ask again.
    }

    resetSaveButton();
    if ("showDirectoryPicker" in window) {
      showSaveSetup();
      showToast("Choose the project folder once to enable direct saving.");
    } else {
      showSaveSetup("This browser cannot write local files directly. Open the dashboard with npm run camera-registration.");
    }
  }
}

function mergePersistedState(persisted) {
  if (persisted?.format !== initialState.format || !Array.isArray(persisted.cameras)) return;
  const persistedById = new Map(persisted.cameras.map((camera) => [camera.id, camera]));
  const merged = clone(initialState);
  merged.updatedAt = persisted.updatedAt || merged.updatedAt;
  merged.cameras = merged.cameras.map((camera) => ({ ...camera, ...(persistedById.get(camera.id) || {}) }));
  state = merged;
  state.cameras.sort((a, b) => naturalSort.compare(a.id, b.id));
}

async function loadWorkspaceJson() {
  try {
    const response = await fetch("/api/placements", { cache: "no-store" });
    if (!response.ok) return;
    const persisted = await response.json();
    // The workspace JSON is the shared source of truth. Browser storage is only a
    // fallback for static/offline previews and must not hide teammates' saved work.
    mergePersistedState(persisted);
    saveState(false);
  } catch {
    // Static-file preview remains usable through local browser storage.
  }
}

function exportReferenceImage() {
  const image = mapImages[activeFloor];
  if (!image) return;
  const maxWidth = 4096;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const output = document.createElement("canvas");
  output.width = Math.round(image.naturalWidth * scale);
  output.height = Math.round(image.naturalHeight * scale);
  const outputContext = output.getContext("2d");
  outputContext.drawImage(image, 0, 0, output.width, output.height);

  const cameras = state.cameras.filter((camera) => camera.floor === activeFloor && camera.position);
  cameras.forEach((camera) => {
    const x = camera.position.x * scale;
    const y = camera.position.y * scale;
    const color = camera.status === "verified" ? "#2bd0b2" : "#f1a734";
    const angle = ((camera.heading ?? 0) - 90) * (Math.PI / 180);
    const length = 40;
    outputContext.strokeStyle = color;
    outputContext.fillStyle = color;
    outputContext.lineWidth = 4;
    outputContext.beginPath();
    outputContext.moveTo(x, y);
    outputContext.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    outputContext.stroke();
    outputContext.beginPath();
    outputContext.arc(x, y, 10, 0, Math.PI * 2);
    outputContext.fill();
    outputContext.strokeStyle = "#111821";
    outputContext.lineWidth = 3;
    outputContext.stroke();
    outputContext.font = "700 22px Inter, system-ui, sans-serif";
    const textWidth = outputContext.measureText(camera.id).width;
    outputContext.fillStyle = "rgba(10,15,21,.9)";
    outputContext.beginPath();
    outputContext.roundRect(x + 17, y - 20, textWidth + 24, 36, 8);
    outputContext.fill();
    outputContext.fillStyle = "#ffffff";
    outputContext.fillText(camera.id, x + 29, y + 6);
  });

  output.toBlob((blob) => {
    if (!blob) return showToast("The reference image could not be generated.");
    downloadBlob(blob, `altanfeethi-${activeFloor}-camera-reference.png`);
    showToast(`${floorConfig[activeFloor].label} reference downloaded.`);
  }, "image/png");
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported.format !== initialState.format || !Array.isArray(imported.cameras)) throw new Error("Unsupported camera placement file.");
      const importedById = new Map(imported.cameras.map((camera) => [camera.id, camera]));
      state = clone(initialState);
      state.cameras = state.cameras.map((camera) => ({ ...camera, ...(importedById.get(camera.id) || {}) }));
      saveState();
      updateCounts();
      renderCameraList();
      renderInspector();
      draw();
      showToast("Camera placement data imported.");
    } catch (error) {
      showToast(error.message || "This JSON file could not be imported.");
    }
  };
  reader.readAsText(file);
}

elements.search.addEventListener("input", renderCameraList);
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    statusFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.toggle("is-active", chip === button));
    renderCameraList();
  });
});

document.querySelectorAll("[data-floor]").forEach((button) => button.addEventListener("click", () => switchFloor(button.dataset.floor)));
document.querySelector("#fit-map").addEventListener("click", fitMap);
document.querySelector("#zoom-in").addEventListener("click", () => {
  const rect = canvas.getBoundingClientRect();
  zoomAt(1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
});
document.querySelector("#zoom-out").addEventListener("click", () => {
  const rect = canvas.getBoundingClientRect();
  zoomAt(0.8, rect.left + rect.width / 2, rect.top + rect.height / 2);
});
document.querySelector("#place-camera").addEventListener("click", beginPlacement);
document.querySelector("#cancel-placement").addEventListener("click", cancelPlacement);
document.querySelector("#locate-marker").addEventListener("click", centerOnSelected);
elements.positionX.addEventListener("change", updateCoordinates);
elements.positionY.addEventListener("change", updateCoordinates);
elements.headingRange.addEventListener("input", (event) => updateHeading(event.target.value));
elements.headingValue.addEventListener("change", (event) => updateHeading(event.target.value));
elements.zone.addEventListener("change", () => updateSelectedCamera((camera) => { camera.zone = elements.zone.value.trim(); }));
elements.group.addEventListener("change", () => updateSelectedCamera((camera) => { camera.group_id = elements.group.value.trim(); }));
elements.notes.addEventListener("change", () => updateSelectedCamera((camera) => { camera.notes = elements.notes.value.trim(); }));
elements.floor.addEventListener("change", () => {
  const camera = getSelectedCamera();
  if (!camera.position) {
    switchFloor(elements.floor.value);
    return;
  }
  updateSelectedCamera((item) => { item.floor = elements.floor.value; });
  switchFloor(elements.floor.value);
});

document.querySelectorAll("[data-status]").forEach((button) => {
  button.addEventListener("click", () => updateSelectedCamera((camera) => { camera.status = button.dataset.status; }));
});

document.querySelector("#save-json-button").addEventListener("click", saveJsonToWorkspace);
document.querySelector("#export-image-button").addEventListener("click", exportReferenceImage);
document.querySelector("#import-button").addEventListener("click", () => document.querySelector("#import-input").click());
document.querySelector("#import-input").addEventListener("change", (event) => {
  if (event.target.files[0]) importJson(event.target.files[0]);
  event.target.value = "";
});

document.querySelector("#show-evidence").addEventListener("click", () => document.querySelector("#evidence-dialog").showModal());
document.querySelector("#show-map-info").addEventListener("click", () => document.querySelector("#map-info-dialog").showModal());
document.querySelector("#close-save-setup").addEventListener("click", () => elements.saveSetupDialog.close());
document.querySelector("#cancel-save-setup").addEventListener("click", () => elements.saveSetupDialog.close());
document.querySelector("#choose-project-folder").addEventListener("click", async () => {
  elements.saveSetupNote.textContent = "";
  try {
    const projectHandle = await window.showDirectoryPicker({ id: "altanfeethi-camera-registration", mode: "readwrite" });
    if (!await writeThroughProjectHandle(projectHandle, true)) throw new Error("Write access was not granted");
    await storeProjectHandle(projectHandle);
    elements.saveSetupDialog.close();
    finishSave("Saved directly to evidence/registration/camera-placements.json");
  } catch (error) {
    if (error.name !== "AbortError") elements.saveSetupNote.textContent = error.message || "The project folder could not be used.";
  }
});
document.querySelector("#show-inspector").addEventListener("click", () => document.querySelector(".inspector-panel").classList.add("is-mobile-open"));
document.querySelector("#close-inspector").addEventListener("click", () => document.querySelector(".inspector-panel").classList.remove("is-mobile-open"));
window.addEventListener("resize", resizeCanvas);

async function startApp() {
  await loadWorkspaceJson();
  updateCounts();
  renderCameraList();
  renderInspector();
  loadMaps();
  resizeCanvas();
}

startApp();
