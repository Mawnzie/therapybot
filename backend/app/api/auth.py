from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.db.models import User
from app.db.database import SessionLocal, engine
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.db.schemas import UserCreate, UserRead, DeleteAccountRequest

from fastapi import APIRouter
from typing import List, Dict

from app.core.config import SECRET_KEY, ALGORITHM,ACCESS_TOKEN_EXPIRE_MINUTES


router = APIRouter()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user  # usually a dict or Pydantic model

#Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username= user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    return "complete"

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

def authenticate_user(username: str, password: str,db: Session):
    user= db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

# Create acess token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt




@router.get("/users", response_model=List[UserRead])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

from fastapi import Form

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    from datetime import timedelta
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}



@router.get("/verify-token")
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "valid": True}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def delete_user(db: Session, username: str) -> bool:
    """Delete a user by username. Returns True if deleted, False if not found."""
    user = db.query(User).filter(User.username == username).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False



@router.delete("/users/{username}")
def delete_account(username: str, request: DeleteAccountRequest, db: Session = Depends(get_db)):
    user = authenticate_user(username, request.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    deleted = delete_user(db, username)
    if deleted:
        return {"detail": f"User {username} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")

"""
@router.delete("/users/{username}")
def delete_account(username: str, password: str, db: Session = Depends(get_db)):
    # Authenticate user
    user = authenticate_user(username, password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    deleted = delete_user(db, username)
    if deleted:
        return {"detail": f"User {username} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")
"""