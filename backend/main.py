from fastapi import Depends, FastAPI, HTTPException, status, Response
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
import cv2
import numpy as np

from fastapi.staticfiles import StaticFiles
import time

COMFY_URI = "http://127.0.0.1:8188/"
app = FastAPI()
app.mount("/static", StaticFiles(directory="/Users/vishal/Desktop/hack/MedX/backend/images"), name="static")
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

    # overlay mask on the original image to highlight the detected region

    query_params = {"filename": sam_detect.image_path, "type": "input"}
    fetch_img_res = requests.get(fetch_img_uri, params=query_params)
    fetch_img_bytes = fetch_img_res.content
    original_image = Image.open(BytesIO(fetch_img_bytes))

    mask_image_rgb = mask_image_r.point(lambda p: p > 128 and 255)
    dull_image = ImageEnhance.Brightness(original_image).enhance(0.3)  
    mask_preview = Image.composite(original_image, dull_image, mask_image_rgb)
    # mask_preview.show()
    filename1 = str(time.time()) + ".png"
    filename2 = "images/"+filename1
    mask_preview.save(filename2)
    # mask_preview.show()
    mask_preview_base64 = base64.b64encode(mask_preview.tobytes()).decode("utf-8")

    original_image.putalpha(mask_image)

    # filename = str(time.time()) + ".png"
    filename = "temp.png"
    original_image.save(filename)
    original_image = open(filename, "rb")
    files = {"image": original_image}
    img_upload_res = requests.post(img_upload_uri, files=files)

    # debug 
    print("mask_preview_base64", mask_preview_base64)

    mask_image_r = np.array(mask_image_r)
    is_success, im_buff_arr = cv2.imencode('.png', mask_image_r)
    byte_im = im_buff_arr.tobytes()

    res = img_upload_res.json()
    res["filename"] = filename2
    bytes = BytesIO(byte_im)
    print("---------------", bytes)
    # res["byte_im"] = bytes
    # res["mask_preview"] = mask_preview_base64
    # res["binary_mask_preview"] = mask_preview.tobytes()
    return res
    

@app.get("/output")
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
    


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
