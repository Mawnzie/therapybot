from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

# Request model
class QueryRequest(BaseModel):
    question: str
    user_id: str  # required: must come from login


class ConversationItem(BaseModel):
    Context: str
    Response: str

class HistoryRequest(BaseModel):
    user_id: str
    password: str


class DeleteAccountRequest(BaseModel):
    password: str
