#!/usr/bin/env python3
"""Generate independent, depth-assisted Gaussian previews of G10's three cameras.

This does not train or fuse a multi-view 3DGS scene. Depth and focal length are
estimated; the camera-local coordinates must never be used as surveyed meters.
"""

import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, maximum_filter, minimum_filter
from scipy.spatial.transform import Rotation
import torch
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

ROOT = Path(__file__).resolve().parents[1]
MODEL = "depth-anything/Depth-Anything-V2-Small-hf"


def write_gaussians(path, positions, scales, quaternions, colors, opacity):
    """Write standard binary PLY (SH0/log scale/logit opacity) and .splat."""
    count = len(positions)
    names = ["x", "y", "z", "nx", "ny", "nz", "f_dc_0", "f_dc_1", "f_dc_2",
             "opacity", "scale_0", "scale_1", "scale_2", "rot_0", "rot_1", "rot_2", "rot_3"]
    data = np.zeros(count, dtype=[(name, "<f4") for name in names])
    for i, name in enumerate(names[:3]):
        data[name] = positions[:, i]
    for i in range(3):
        data[f"f_dc_{i}"] = (colors[:, i].astype(np.float32) / 255 - .5) / .28209479177387814
        data[f"scale_{i}"] = np.log(scales[:, i])
    data["opacity"] = math.log(opacity / (1 - opacity))
    # scipy and Three.js use xyzw; the Gaussian file formats use wxyz.
    wxyz = quaternions[:, [3, 0, 1, 2]]
    for i in range(4):
        data[f"rot_{i}"] = wxyz[:, i]
    header = ("ply\nformat binary_little_endian 1.0\n"
              "comment G10 depth-assisted preview; independent camera; arbitrary scale\n"
              f"element vertex {count}\n" + "".join(f"property float {n}\n" for n in names)
              + "end_header\n")
    with path.with_suffix(".ply").open("wb") as output:
        output.write(header.encode("ascii"))
        output.write(data.tobytes())
    packed = np.empty(count, dtype=[("position", "<f4", 3), ("scale", "<f4", 3),
                                  ("rgba", "u1", 4), ("rotation", "u1", 4)])
    packed["position"] = positions
    packed["scale"] = scales
    packed["rgba"][:, :3] = colors
    packed["rgba"][:, 3] = round(opacity * 255)
    packed["rotation"] = np.clip(np.rint(wxyz * 128 + 128), 0, 255).astype(np.uint8)
    path.with_suffix(".splat").write_bytes(packed.tobytes())


def project(image, disparity, fov, stride):
    height, width = disparity.shape
    lo, hi = np.percentile(disparity, [2, 98])
    normalized = np.clip((disparity - lo) / max(float(hi - lo), 1e-6), 0, 1)
    # Relative inverse depth is remapped to an explicit visualization range.
    depth = 1 / (1 / 6 + normalized * (1 / 1.2 - 1 / 6))
    depth = gaussian_filter(depth, .65)
    focal = width / (2 * math.tan(math.radians(fov / 2)))
    y, x = np.mgrid[:height, :width]
    points = np.stack([(x - (width - 1) / 2) * depth / focal,
                       -(y - (height - 1) / 2) * depth / focal, -depth], axis=-1)
    # Surface-aligned, anisotropic Gaussians with a small normal thickness.
    dy, dx = np.gradient(points, axis=(0, 1))
    tangent = dx / np.maximum(np.linalg.norm(dx, axis=-1, keepdims=True), 1e-8)
    normal = np.cross(dx, -dy)
    normal /= np.maximum(np.linalg.norm(normal, axis=-1, keepdims=True), 1e-8)
    bitangent = np.cross(normal, tangent)
    matrices = np.stack([tangent, bitangent, normal], axis=-1)
    footprint = depth / focal * stride * .72
    sx = np.minimum(np.linalg.norm(dx, axis=-1) * stride * .72, footprint * 2.5)
    sy = np.minimum(np.linalg.norm(dy, axis=-1) * stride * .72, footprint * 2.5)
    scales = np.stack([sx, sy, footprint * .18], axis=-1)
    # Do not bridge silhouettes with stretched splats.
    jump = (maximum_filter(depth, size=3) - minimum_filter(depth, size=3)) / depth
    mask = np.zeros((height, width), dtype=bool)
    mask[1:-1:stride, 1:-1:stride] = True
    mask &= jump < .12
    quaternion = Rotation.from_matrix(matrices[mask]).as_quat()
    return points[mask], scales[mask], quaternion, np.asarray(image)[mask], normalized, focal


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default=MODEL, help="Hugging Face model ID or local model folder")
    parser.add_argument("--output", type=Path, default=ROOT / "experiments/g10-gaussian")
    parser.add_argument("--width", type=int, default=960)
    parser.add_argument("--stride", type=int, default=2)
    parser.add_argument("--fov", type=float, default=80, help="Assumed horizontal FOV, not calibration")
    args = parser.parse_args()
    if args.width < 64 or args.stride < 1 or not 20 <= args.fov <= 140:
        parser.error("Use width >= 64, stride >= 1 and FOV between 20 and 140 degrees")
    torch.set_num_threads(6)
    processor = AutoImageProcessor.from_pretrained(args.model)
    model = AutoModelForDepthEstimation.from_pretrained(args.model).eval()
    args.output.mkdir(parents=True, exist_ok=True)
    entries = []
    for camera in ["B6", "B4", "B5"]:
        source = ROOT / "evidence/wide capture snapshots" / f"{camera}.jpg"
        image = Image.open(source).convert("RGB")
        image.thumbnail((args.width, args.width), Image.Resampling.LANCZOS)
        print(f"{camera}: estimating relative depth from {image.width} x {image.height}", flush=True)
        inputs = processor(images=image, return_tensors="pt")
        with torch.inference_mode():
            prediction = model(**inputs).predicted_depth
            disparity = torch.nn.functional.interpolate(prediction.unsqueeze(1),
                size=(image.height, image.width), mode="bicubic", align_corners=False)[0, 0].numpy()
        points, scales, quaternions, colors, normalized, focal = project(
            image, disparity, args.fov, args.stride)
        write_gaussians(args.output / camera, points, scales, quaternions, colors, .94)
        image.save(args.output / f"{camera}-source.jpg", quality=92)
        Image.fromarray((normalized * 255).astype(np.uint8)).save(args.output / f"{camera}-depth.png")
        entry = {"camera": camera, "source": str(source.relative_to(ROOT)),
                 "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                 "splats": len(points), "width": image.width, "height": image.height,
                 "focalLengthPx": focal, "horizontalFovDegrees": args.fov,
                 "verticalFovDegrees": math.degrees(2 * math.atan(image.height / (2 * focal))),
                 "targetDepth": float(np.median(-points[:, 2])),
                 "bounds": {"min": points.min(axis=0).tolist(), "max": points.max(axis=0).tolist()}}
        entries.append(entry)
        print(f"{camera}: saved {len(points):,} Gaussian splats", flush=True)
    metadata = {"format": "altanfeethi-gaussian-preview", "version": 1,
                "block": "ground/g10", "method": "monocular-depth-to-anisotropic-gaussians",
                "depthModel": MODEL, "device": "cpu", "trainedMultiView3DGS": False,
                "fused": False, "units": "arbitrary visualization units",
                "coordinateSystem": "camera-local; X right, Y up, camera looks down -Z",
                "assumptions": ["Uncalibrated 80-degree horizontal FOV by default",
                    "Relative depth remapped to 1.2–6 visualization units",
                    "No multi-view alignment, hidden-surface reconstruction or semantic seat mapping",
                    "Reflections and areas beyond G10 remain in the source camera imagery"],
                "stride": args.stride, "views": entries}
    (args.output / "manifest.json").write_text(json.dumps(metadata, indent=2) + "\n")


if __name__ == "__main__":
    main()
