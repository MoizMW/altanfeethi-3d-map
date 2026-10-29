import { createServer } from "node:http";
import { readFile, rename, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./", import.meta.url)));
const projectRoot = resolve(root, "../..");
const placementFile = resolve(projectRoot, "evidence/registration/camera-placements.json");
const placementTempFile = resolve(projectRoot, "evidence/registration/.camera-placements.json.tmp");
const port = Number(process.argv[2] || 4199);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml; charset=utf-8",
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": type.startsWith("image/") ? "public, max-age=60" : "no-store",
  });
  response.end(body);
}

async function readRequestJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 5 * 1024 * 1024) throw new Error("Placement file is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleApi(request, response) {
  if (request.method === "GET") {
    try {
      send(response, 200, await readFile(placementFile), contentTypes[".json"]);
    } catch (error) {
      if (error.code === "ENOENT") return send(response, 404, JSON.stringify({ error: "No saved placement file yet" }), contentTypes[".json"]);
      throw error;
    }
    return;
  }

  if (request.method === "PUT") {
    const payload = await readRequestJson(request);
    if (payload?.format !== "altanfeethi-camera-registration" || payload?.version !== 1 || !Array.isArray(payload?.cameras)) {
      return send(response, 400, JSON.stringify({ error: "Invalid camera placement data" }), contentTypes[".json"]);
    }
    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    await writeFile(placementTempFile, serialized, "utf8");
    await rename(placementTempFile, placementFile);
    send(response, 200, JSON.stringify({ ok: true, file: "evidence/registration/camera-placements.json" }), contentTypes[".json"]);
    return;
  }

  send(response, 405, JSON.stringify({ error: "Method not allowed" }), contentTypes[".json"]);
}

async function handleStatic(request, response, pathname) {
  const relativePath = pathname === "/" || pathname === "/direct-save" ? "/index.html" : decodeURIComponent(pathname);
  let absolutePath;
  if (["/index.html", "/app.js", "/styles.css", "/camera-groups.js"].includes(relativePath)) absolutePath = resolve(root, `.${relativePath}`);
  else if (relativePath.startsWith("/map/")) absolutePath = resolve(projectRoot, "evidence/maps", relativePath.slice(5));
  else if (relativePath.startsWith("/camera_snapshot/")) absolutePath = resolve(projectRoot, "evidence/camera-snapshots", relativePath.slice(17));
  else if (relativePath.startsWith("/camera_marking/")) absolutePath = resolve(projectRoot, "evidence/camera-marking", relativePath.slice(16));
  else return send(response, 404, "Not found");
  if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`) && !absolutePath.startsWith(`${resolve(projectRoot,"evidence")}${sep}`)) return send(response, 403, "Forbidden");

  try {
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) return send(response, 404, "Not found");
    const body = await readFile(absolutePath);
    send(response, 200, body, contentTypes[extname(absolutePath).toLowerCase()] || "application/octet-stream");
  } catch (error) {
    if (error.code === "ENOENT") return send(response, 404, "Not found");
    throw error;
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    if (url.pathname === "/api/placements") await handleApi(request, response);
    else await handleStatic(request, response, url.pathname);
  } catch (error) {
    console.error(error);
    send(response, 500, JSON.stringify({ error: "Internal server error" }), contentTypes[".json"]);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Altanfeethi camera registration: http://127.0.0.1:${port}`);
  console.log("Save target: evidence/registration/camera-placements.json");
});
