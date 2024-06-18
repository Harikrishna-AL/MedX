from fastapi import Depends, FastAPI, HTTPException, UploadFile, status, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from routes import auth
import uvicorn
import requests
import base64
from PIL import Image, ImageEnhance
from io import BytesIO
import os
import io
import time
from rembg import remove
import numpy as np
import cv2
import scipy.sparse
from scipy.sparse.linalg import spsolve

COMFY_URI = "http://127.0.0.1:8188/"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


class SAMDetect(BaseModel):
    image_path: str
    positive_points: List[List[float]]
    negative_points: List[List[float]]
    threshold: float


def laplacian_matrix(n, m):
    """Generate the Poisson matrix.

    Refer to:
    https://en.wikipedia.org/wiki/Discrete_Poisson_equation

    Note: it's the transpose of the wiki's matrix
    """
    mat_D = scipy.sparse.lil_matrix((m, m))
    mat_D.setdiag(-1, -1)
    mat_D.setdiag(4)
    mat_D.setdiag(-1, 1)

    mat_A = scipy.sparse.block_diag([mat_D] * n).tolil()

    mat_A.setdiag(-1, 1 * m)
    mat_A.setdiag(-1, -1 * m)

    return mat_A


def poisson_edit(source, target, mask, offset):
    """The poisson blending function.

    Refer to:
    Perez et. al., "Poisson Image Editing", 2003.
    """

    # Assume:
    # target is not smaller than source.
    # shape of mask is same as shape of target.
    y_max, x_max = target.shape[:-1]
    y_min, x_min = 0, 0

    x_range = x_max - x_min
    y_range = y_max - y_min

    M = np.float32([[1, 0, offset[0]], [0, 1, offset[1]]])
    source = cv2.warpAffine(source, M, (x_range, y_range))

    mask = mask[y_min:y_max, x_min:x_max]
    mask[mask != 0] = 1
    # mask = cv2.threshold(mask, 127, 1, cv2.THRESH_BINARY)

    mat_A = laplacian_matrix(y_range, x_range)

    # for \Delta g
    laplacian = mat_A.tocsc()

    # set the region outside the mask to identity
    for y in range(1, y_range - 1):
        for x in range(1, x_range - 1):
            if mask[y, x] == 0:
                k = x + y * x_range
                mat_A[k, k] = 1
                mat_A[k, k + 1] = 0
                mat_A[k, k - 1] = 0
                mat_A[k, k + x_range] = 0
                mat_A[k, k - x_range] = 0

    # corners
    # mask[0, 0]
    # mask[0, y_range-1]
    # mask[x_range-1, 0]
    # mask[x_range-1, y_range-1]

    mat_A = mat_A.tocsc()

    mask_flat = mask.flatten()
    for channel in range(source.shape[2]):
        source_flat = source[y_min:y_max, x_min:x_max, channel].flatten()
        target_flat = target[y_min:y_max, x_min:x_max, channel].flatten()

        # concat = source_flat*mask_flat + target_flat*(1-mask_flat)

        # inside the mask:
        # \Delta f = div v = \Delta g
        alpha = 1
        mat_b = laplacian.dot(source_flat) * alpha

        # outside the mask:
        # f = t
        mat_b[mask_flat == 0] = target_flat[mask_flat == 0]

        x = spsolve(mat_A, mat_b)
        # print(x.shape)
        x = x.reshape((y_range, x_range))
        # print(x.shape)
        x[x > 255] = 255
        x[x < 0] = 0
        x = x.astype("uint8")
        # x = cv2.normalize(x, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
        # print(x.shape)

        target[y_min:y_max, x_min:x_max, channel] = x

    return target


@app.post("/sam/detect")
def detect(sam_detect: SAMDetect):
    detect_uri = COMFY_URI + "sam/detect"
    fetch_img_uri = COMFY_URI + "view"
    img_upload_uri = COMFY_URI + "upload/image"

    detect_json = {
        "positive_points": sam_detect.positive_points,
        "negative_points": sam_detect.negative_points,
        "threshold": sam_detect.threshold,
    }
    detect_res = requests.post(detect_uri, json=detect_json)
    image_bytes = detect_res.content
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    mask_image_r = Image.open(BytesIO(image_bytes)).convert("L")
    mask_image = mask_image_r.point(lambda p: 255 - p)

    query_params = {"filename": sam_detect.image_path, "type": "input"}
    fetch_img_res = requests.get(fetch_img_uri, params=query_params)
    fetch_img_bytes = fetch_img_res.content
    original_image = Image.open(BytesIO(fetch_img_bytes))

    mask_image_rgb = mask_image_r.point(lambda p: p > 128 and 255)
    dull_image = ImageEnhance.Brightness(original_image).enhance(0.3)
    mask_preview = Image.composite(original_image, dull_image, mask_image_rgb)

    filename1 = str(time.time()) + ".png"
    mask_path = "../ui/public/" + filename1
    mask_preview.save(mask_path)

    # mask_preview_base64 = base64.b64encode(mask_preview.tobytes())
    original_image.putalpha(mask_image)
    original_image.save("temp.png")
    original_image = open("temp.png", "rb")
    files = {"image": original_image}
    img_upload_res = requests.post(img_upload_uri, files=files)

    res = img_upload_res.json()
    res["mask_filename"] = filename1
    return res


@app.post("/output")
def get_output(workflow_json: dict, image_path: str):
    prompt_uri = COMFY_URI + "prompt"
    COMFY_OUTPUT_LOCATION = "/Users/vishal/Desktop/hack/ComfyUI/output"

    # print(workflow_json)
    workflow_json["2"]["inputs"]["image"] = image_path
    workflow = {"prompt": workflow_json}
    prompt_res = requests.post(prompt_uri, json=workflow)

    if prompt_res.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow failed to run",
        )
    print("Workflow ran successfully!")
    time.sleep(1.5)

    files = os.listdir(COMFY_OUTPUT_LOCATION)
    files = [f for f in files if f.endswith(".png")]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(COMFY_OUTPUT_LOCATION, x)))
    latest_file = files[-1]

    with open(os.path.join(COMFY_OUTPUT_LOCATION, latest_file), "rb") as f:
        return Response(f.read(), media_type="image/png")


@app.post("/blend/upload")
def upload_blend(src_image: UploadFile):
    try:
        img = Image.open(BytesIO(src_image.file.read()))
        img.save("tempsdfasdfasdf.png")
    except Exception as e:
        return {"success": "false", "message": str(e)}
    # img = open("temp.png", "rb")
    # files = {"image": img}
    return {"success": "true", "message": "Image uploaded successfully"}


@app.post("/blend")
def poisson_blend(target_image: UploadFile):
    source_alpha = Image.open("tempsdfasdfasdf.png").convert("RGBA")
    target_image = Image.open(BytesIO(target_image.file.read())).convert("RGB")
    target_image = target_image.resize(source_alpha.size)
    source_image = source_alpha.convert("RGB")
    source_mask = source_alpha.split()[3]
    # convert the image to numpy array like cv2 reads it
    source_image = np.array(source_image)
    target_image = np.array(target_image)
    source_mask = np.array(source_mask)

    # print(source_image.shape, target_image.shape, source_mask.shape)
    poisson_blend_image = poisson_edit(source_image, target_image, source_mask, (0, 0))
    output_binary = io.BytesIO()
  
    is_success, buffer = cv2.imencode(".png", poisson_blend_image)
    output_binary.write(buffer.tobytes())
    output_binary.seek(0)
    return StreamingResponse(output_binary, media_type="image/png")

    


@app.post("/removebackground")
def remove_background(seg_image: UploadFile):

    img = Image.open(BytesIO(seg_image.file.read()))
    img.save("asset.png")

    with open("asset.png", "rb") as i:
        input = i.read()
        output = remove(input)

    output_binary = io.BytesIO(output)

    return StreamingResponse(output_binary, media_type="image/png")


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
