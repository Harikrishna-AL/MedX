from fastapi import Depends, FastAPI, HTTPException, status, Response, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Tuple, Optional
from routes import auth
import uvicorn
import requests
import base64
from PIL import Image, ImageEnhance
from io import BytesIO
import os
import io
import time
from builtins import range
import numpy as np
import scipy.sparse
import PIL.Image
import pyamg

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

class Blend(BaseModel):
    img_target: UploadFile = File(...)
    img_source: UploadFile = File(...)
    img_mask: UploadFile = File(...)
    # offset: Tuple[int, int] = (0, 0)

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

    files = os.listdir(COMFY_OUTPUT_LOCATION)
    files = [f for f in files if f.endswith(".png")]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(COMFY_OUTPUT_LOCATION, x)))
    latest_file = files[-1]

    with open(os.path.join(COMFY_OUTPUT_LOCATION, latest_file), "rb") as f:
        return Response(f.read(), media_type="image/png")
    
@app.post("/blend")
def blend(data: Blend, offset = (0, 0)):
    # compute regions to be blended
    # img_target = Image.open(data.img_target.file)
    # img_source = Image.open(data.img_source.file)
    # img_mask = Image.open(data.img_mask.file)
    # # offset = offset

    # img_target = np.array(img_target)
    # img_source = np.array(img_source)
    # img_mask = np.array(img_mask)

    # region_source = (
    #     max(-offset[0], 0),
    #     max(-offset[1], 0),
    #     min(img_target.shape[0] - offset[0], img_source.shape[0]),
    #     min(img_target.shape[1] - offset[1], img_source.shape[1]))
    # region_target = (
    #     max(offset[0], 0),
    #     max(offset[1], 0),
    #     min(img_target.shape[0], img_source.shape[0] + offset[0]),
    #     min(img_target.shape[1], img_source.shape[1] + offset[1]))
    # region_size = (region_source[2] - region_source[0], region_source[3] - region_source[1])

    # # clip and normalize mask image
    # img_mask = img_mask[region_source[0]:region_source[2], region_source[1]:region_source[3]]
    # img_mask[img_mask == 0] = False
    # img_mask[img_mask != False] = True

    # # determines the diagonals on the coefficient matrix
    # positions = np.where(img_mask)
    # # setting the positions to be in a flatted manner
    # positions = (positions[0] * region_size[1]) + positions[1]

    # # row and col size of coefficient matrix
    # n = np.prod(region_size)

    # main_diagonal = np.ones(n)
    # main_diagonal[positions] = 4
    # diagonals = [main_diagonal]
    # diagonals_positions = [0]

    # # creating the diagonals of the coefficient matrix
    # for diagonal_pos in [-1, 1, -region_size[1], region_size[1]]:
    #     in_bounds_indices = None
    #     if np.any(positions + diagonal_pos > n):
    #         in_bounds_indices = np.where(positions + diagonal_pos < n)[0]
    #     elif np.any(positions + diagonal_pos < 0):
    #         in_bounds_indices = np.where(positions + diagonal_pos >= 0)[0]
    #     in_bounds_positions = positions[in_bounds_indices]

    #     diagonal = np.zeros(n)
    #     diagonal[in_bounds_positions + diagonal_pos] = -1
    #     diagonals.append(diagonal)
    #     diagonals_positions.append(diagonal_pos)
    # A = scipy.sparse.spdiags(diagonals, diagonals_positions, n, n, 'csr')

    # # create poisson matrix for b
    # P = pyamg.gallery.poisson(img_mask.shape)

    # # get positions in mask that should be taken from the target
    # inverted_img_mask = np.invert(img_mask.astype(np.bool)).flatten()
    # positions_from_target = np.where(inverted_img_mask)[0]

    # # for each layer (ex. RGB)
    # for num_layer in range(img_target.shape[2]):
    #     # get subimages
    #     t = img_target[region_target[0]:region_target[2], region_target[1]:region_target[3], num_layer]
    #     s = img_source[region_source[0]:region_source[2], region_source[1]:region_source[3], num_layer]
    #     t = t.flatten()
    #     s = s.flatten()

    #     # create b
    #     b = P * s
    #     b[positions_from_target] = t[positions_from_target]

    #     # solve Ax = b
    #     x = scipy.sparse.linalg.spsolve(A, b)

    #     # assign x to target image
    #     x = np.reshape(x, region_size)
    #     x = np.clip(x, 0, 255)
    #     x = np.array(x, img_target.dtype)
    #     img_target[region_target[0]:region_target[2], region_target[1]:region_target[3], num_layer] = x
    
    # img_target = Image.fromarray(img_target)
    # # create a BytesIO object and save the image to it
    # img_io = BytesIO()
    # img_target.save(img_io, 'JPEG', quality=70)
    # img_io.seek(0)
    # # return a streaming response
    # return StreamingResponse(img_io, media_type='image/jpeg')

    # return img_target
    return {"message": "success"}
if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
