from datetime import date
from typing import List
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime

#----------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    userType: str
    userId: str

class RegisterRequest(BaseModel):
    email: str
    password: str

class UserInfo(BaseModel):
    client_id: Optional[int]
    client_username: Optional[str]
    client_email: Optional[str]
    client_is_admin: Optional[bool]
    client_phone_number: Optional[str]
    person_id: Optional[int]
    person_organization: Optional[str]
    person_first_name: Optional[str]
    person_last_name: Optional[str]
    person_patronymic: Optional[str]
    person_citizenship: Optional[str]
    person_description: Optional[str]

class UserInfoList(BaseModel):
    users_list: List[UserInfo]

class MessageSendInfo(BaseModel):
    fromId: Optional[int]
    toId: Optional[int]
    theme: Optional[str]
    subject: Optional[str]

class MessageInfo(BaseModel):
    from_id: Optional[int]
    to_id: Optional[int]
    date: Optional[datetime]
    theme: Optional[str]
    subject: Optional[str]

class MessageInfoList(BaseModel):
    lst: List[MessageInfo]

class MarketInfo(BaseModel):
    id: Optional[int]
    name: Optional[str]
    schemepng: Optional[bytes]
    isopened: Optional[bool]
    placescount: Optional[int]
    ownerid: Optional[int]
    address: Optional[str]
class MarketInfoList(BaseModel):
    lst: List[MarketInfo]

class Tradeplace(BaseModel):
    marketid: int
    marketnumber: int
    price: float
    info: Optional[str]
    ownerid: int

class ContractInfo(BaseModel):
    id: int
    marketid: int
    marketnumber: int 
    tenantid: int
    datecreated: datetime
    dayscount: int
    price: float
    info: str
    ownerid: int

class ContractInfoList(BaseModel):
    lst: List[ContractInfo]

class Contract(BaseModel):
    marketid: Optional[int]
    marketnumber: Optional[int]
    tenantid: Optional[int]
    datecreated: Optional[datetime]
    dayscount: Optional[int]

class Event(BaseModel):
    EventId: int
    EventName: str
    Description: str
    OwnerId: int
    StartDate: Optional[datetime]
    EndDate: Optional[datetime]
    

class EventList(BaseModel):
    lst: List[Event]

class BackupsGetResponse(BaseModel):
    backup_names_list: List[str]

class BackUpRequest(BaseModel):
    filename: str

class ClientCheckRequest(BaseModel):
    client_id: int  