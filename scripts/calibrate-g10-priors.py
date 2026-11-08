"""Fit provisional G10 cameras to manually reviewed wide-photo landmarks.

Landmark locations are approximate image observations, NOT surveyed calibration.
The existing model supplies soft spatial priors; its source files are unchanged.
"""
import json
import hashlib
from pathlib import Path
import cv2
import numpy as np
from scipy.optimize import least_squares

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experiments/g10-gaussian'
objects = {o['id']: o for o in json.loads((ROOT / 'blocks/ground/g10/objects.json').read_text())['objects']}


def point(object_id, height=0., z=0.):
    return np.array(objects[object_id]['position']) + [0, height, z]


landmarks = {
    'divider-near': point('g10-divider-01', 2.25, -1.325),
    'divider-far': point('g10-divider-01', 2.25, 1.325),
    'table-positive-near': point('g10-table-01', .42, -.75),
    'table-positive-far': point('g10-table-01', .42, .75),
    'table-negative-near': point('g10-table-02', .42, -.75),
    'table-negative-far': point('g10-table-02', .42, .75),
    'chair-positive-near': point('g10-chair-01', .47),
    'chair-positive-far': point('g10-chair-02', .47),
    'chair-negative-near': point('g10-chair-03', .47),
    'chair-negative-far': point('g10-chair-04', .47),
    'side-positive': point('g10-side-table-01', .55),
    'side-negative': point('g10-side-table-02', .55),
    'sofa-positive': point('g10-sofa-01', .43),
    'sofa-negative': point('g10-sofa-02', .43),
}
observations = {
    'B6': {'divider-near': [944, 569], 'divider-far': [982, 173],
           'table-positive-near': [294, 888], 'table-positive-far': [351, 640],
           'table-negative-near': [1505, 1042], 'table-negative-far': [1486, 755],
           'chair-positive-far': [466, 550], 'chair-negative-far': [1434, 665],
           'side-positive': [717, 510], 'side-negative': [1240, 591]},
    'B4': {'divider-near': [1175, 40], 'divider-far': [1610, 186],
           'table-negative-near': [742, 690], 'table-negative-far': [937, 957],
           'chair-negative-near': [590, 641], 'side-negative': [1388, 946],
           'sofa-negative': [1085, 716]},
    'B5': {'divider-far': [147, 185],
           'table-positive-near': [1008, 659], 'table-positive-far': [833, 933],
           'chair-positive-near': [1166, 596], 'side-positive': [325, 930],
           'sofa-positive': [626, 677]},
}


def project(params, xyz):
    k = np.array([[np.exp(params[6]), 0, 960.], [0, np.exp(params[6]), 540.], [0, 0, 1.]])
    return cv2.projectPoints(xyz, params[:3], params[3:6], k, None)[0].reshape(-1, 2)


results = {}
initial_parameters = []
for c, obs in observations.items():
    xyz = np.array([landmarks[k] for k in obs], np.float64)
    uv = np.array(list(obs.values()), np.float64)
    best = None
    for focal in [900, 1200, 1500, 1900, 2400]:
        k = np.array([[focal, 0, 960.], [0, focal, 540.], [0, 0, 1.]])
        success, rv, tv = cv2.solvePnP(xyz, uv, k, None, flags=cv2.SOLVEPNP_SQPNP)
        if not success:
            continue
        init = np.r_[rv.ravel(), tv.ravel(), np.log(focal)]
        fit = least_squares(lambda p: (project(p, xyz) - uv).ravel(), init,
                            bounds=(np.r_[np.full(6, -np.inf), np.log(700)],
                                    np.r_[np.full(6, np.inf), np.log(3000)]),
                            loss='soft_l1', f_scale=20, max_nfev=2000)
        if best is None or fit.cost < best.cost:
            best = fit
    rotation = cv2.Rodrigues(best.x[:3])[0]
    pose = np.eye(4)
    pose[:3, :3] = rotation.T
    pose[:3, 3] = -rotation.T @ best.x[3:6]
    predicted = project(best.x, xyz)
    error = np.linalg.norm(predicted - uv, axis=-1)
    results[c] = {'pose': pose.tolist(), 'focal': float(np.exp(best.x[6])),
                  'observations': {k: {'pixel': obs[k], 'priorPosition': landmarks[k].tolist(),
                                       'reprojection': predicted[i].tolist(), 'errorPixels': float(error[i])}
                                   for i, k in enumerate(obs)},
                  'rmsPixels': float(np.sqrt(np.mean(error ** 2)))}
    print(c, 'focal', results[c]['focal'], 'camera', pose[:3, 3], 'RMS px', results[c]['rmsPixels'], flush=True)
    initial_parameters.append(best.x)

# Bundle the common observed landmarks together. The 3D authoring positions are
# uncertain priors, so allow them to move instead of treating them as survey data.
names = list(landmarks)
prior_xyz = np.array([landmarks[k] for k in names])
indices = {c: np.array([names.index(k) for k in obs]) for c, obs in observations.items()}
mounts = np.array([[0, 3.6, -2.7], [-3.1, 3.6, 2.5], [3.1, 3.6, 2.5]])


def residual(params):
    cams, xyz = params[:21].reshape(3, 7), params[21:].reshape(-1, 3)
    residuals = [((xyz - prior_xyz) / np.array([.20, .07, .20])).ravel()]
    for i, (c, obs) in enumerate(observations.items()):
        residuals.append(((project(cams[i], xyz[indices[c]]) - np.array(list(obs.values()))) / 10).ravel())
        rotation = cv2.Rodrigues(cams[i, :3])[0]
        center = -rotation.T @ cams[i, 3:6]
        residuals.append((center - mounts[i]) / np.array([.9, .45, .9]))
        residuals.append(np.array([(cams[i, 6] - np.log(1450)) / .2]))
    return np.concatenate(residuals)


fit = least_squares(residual, np.r_[np.array(initial_parameters).ravel(), prior_xyz.ravel()],
                    max_nfev=1000, loss='linear', ftol=1e-9)
fitted_xyz = fit.x[21:].reshape(-1, 3)
for i, (c, obs) in enumerate(observations.items()):
    params = fit.x[i * 7:(i + 1) * 7]
    rotation = cv2.Rodrigues(params[:3])[0]
    pose = np.eye(4)
    pose[:3, :3] = rotation.T
    pose[:3, 3] = -rotation.T @ params[3:6]
    predicted = project(params, fitted_xyz[indices[c]])
    error = np.linalg.norm(predicted - np.array(list(obs.values())), axis=-1)
    results[c].update(pose=pose.tolist(), focal=float(np.exp(params[6])), rmsPixels=float(np.sqrt(np.mean(error ** 2))))
    for j, key in enumerate(obs):
        results[c]['observations'][key].update(fittedPosition=fitted_xyz[names.index(key)].tolist(),
                                               reprojection=predicted[j].tolist(), errorPixels=float(error[j]))
    print('Joint', c, 'focal', results[c]['focal'], 'camera', pose[:3, 3], 'RMS', results[c]['rmsPixels'], flush=True)

sources = ['blocks/ground/g10/objects.json', 'blocks/ground/g10/architecture.json',
           'evidence/registration/camera-placements.json']
report = {'status': 'provisional-needs-reprojection-review', 'cameras': results,
          'landmarks': {k: v.tolist() for k, v in landmarks.items()},
          'sourceHashes': {s: hashlib.sha256((ROOT / s).read_bytes()).hexdigest() for s in sources},
          'notes': ['Wide-image observations manually estimated at 1920x1080; normal-view ROIs were not transferred',
                    'The floor map is an illustrative plan, not a calibrated metric survey',
                    'B4 observes the negative-X sofa and B5 the positive-X sofa, based on the corrected teal-wall orientation',
                    'Object centers and dimensions are soft priors; existing source models and registration remain unchanged',
                    'Mount priors are estimated from local room boundaries and camera-side ordering, not a metric transform of the illustrative map',
                    'Fit errors are on the annotated landmarks, not independent validation'],
          'fittedLandmarks': {k: fitted_xyz[j].tolist() for j, k in enumerate(names)},
          'landmarkMovementRms': float(np.sqrt(np.mean((fitted_xyz-prior_xyz)**2)))}
(OUT / 'camera-priors.json').write_text(json.dumps(report, indent=2) + '\n')
