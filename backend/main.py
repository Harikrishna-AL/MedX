from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
from routes import auth

app = FastAPI()

app.include_router(auth.router)
