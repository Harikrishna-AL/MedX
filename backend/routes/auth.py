from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter
from pymongo import MongoClient
from bson.objectid import ObjectId

router = APIRouter()

SECRET_KEY = "83daa0256a2289b0fb23693bf1f6034d44396675749244721a2b20e896e11662"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Setup MongoDB client
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
users_collection = db["users"]
images_collection = db["images"]


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str = None


class User(BaseModel):
    username: str
    email: str
    full_name: str = None
    disabled: bool = None


class UserInDB(User):
    hashed_password: str


class UserData(BaseModel):
    _id: ObjectId
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    hashed_password: str


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class ImageStoreResponse(BaseModel):
    id: str
    filename: str
    username: str
    type: str


class ImageResponse(BaseModel):
    id: str
    filename: str
    username: str
    content: str
    type: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(username: str):
    user = users_collection.find_one({"username": username})

    print("-")
    print(user)
    print("-")
    if user:
        return UserData(**user)


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False

    return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credential_exception

        token_data = TokenData(username=username)
    except JWTError:
        raise credential_exception

    user = get_user(username=token_data.username)
    if user is None:
        raise credential_exception

    return user


async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=User)
async def create_user(user: UserCreate):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(user.password)

    user_in_db = UserInDB(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    users_collection.insert_one(user_in_db.model_dump())

    return user_in_db


@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/users/me/items")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user}]


@router.post("/upload-image", response_model=ImageStoreResponse)
async def upload_image(
    file: UploadFile = File(...), current_user: dict = Depends(get_current_user), type: str = None
):
    # Read the file contents
    import base64

    file_contents = await file.read()
    file_contents_base64 = base64.b64encode(file_contents).decode("utf-8")
    print(current_user)
    # Store the file in the MongoDB database
    image_data = {
        "filename": file.filename,
        "content": file_contents_base64,
        "username": current_user.username,
        "type": type,
    }
    result = images_collection.insert_one(image_data)

    # Return the response with the file ID, filename, and user ID
    return ImageStoreResponse(
        id=str(result.inserted_id),
        filename=file.filename,
        username=current_user.username,
        type = type
    )


@router.get("/images", response_model=List[ImageResponse])
async def get_user_images(current_user: dict = Depends(get_current_user)):
    username = current_user.username
    images = images_collection.find({"username": username})

    user_images = []
    for image in images:
        user_images.append(
            ImageResponse(
                id=str(image["_id"]),
                filename=image["filename"],
                username=image["username"],
                content=image["content"],
                type=image["type"]
            )
        )

    return user_images
