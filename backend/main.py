import base64
from fastapi import Depends, FastAPI, HTTPException, Response, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Body
from database import Database
from auth import AuthService
import models
from asyncpg.exceptions import PostgresError
import os
import subprocess
from datetime import datetime
from typing import List
from models import MarketInfo

app = FastAPI()

BACKUP_DIR = "/backups"

origins = [
    "http://localhost:3000", 
    "http://frontend:3000", 
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database(config_path="config.json")
auth_service = AuthService(config_path="config.json", db=db)
auth_scheme = HTTPBearer()

@app.on_event("startup")
async def startup():
    await db.connect()

# В ЭТОМ ФАЙЛЕ ХРАНИТСЯ ВСЕ АПИ

#REGISTER AND LOGIN
#--------------------------------------------------------------------------------------       
@app.post("/login", response_model=models.LoginResponse)
async def login(request: models.LoginRequest):
    async with db.pool.acquire() as conn:
        users = await db.get_user_by_email(conn, request.email)
        if not users:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user = users[0]
        if not auth_service._AuthService__verify_password(request.password, user['user_hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        try:
            token = auth_service._AuthService__create_jwt(user_id=user['user_id'], user_email=user['user_email'])
            isAdmin = user['is_admin']
            if(isAdmin):
                return {"token": token, "userType" : "admin", "userId" : str(user['user_id']) }
            else:
                return {"token": token, "userType": "common", "userId" : str(user['user_id']) }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"login error: {str(e)}")

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: models.RegisterRequest):
    async with db.pool.acquire() as conn:
        existing_user = await db.get_user_by_email(conn, user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        try:
            # Хэшируем пароль и добавляем нового пользователя
            hashed_password = auth_service._AuthService__hash_password(user.password)
            await db.add_new_user(conn, user.email, hashed_password)
            return {"message": "User registered successfully"}   
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"register error: {str(e)}")
#--------------------------------------------------------------------------------------  
# PROFILE 
#--------------------------------------------------------------------------------------  
@app.get("/profile/get/{user_id}", response_model=models.UserInfo)
async def profile_get(user_id: int):
    async with db.pool.acquire() as conn:
        try:
            user = await db.get_user_data_by_id(conn, user_id)
            return db.create_user_info(user)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"profile_get error: {str(e)}")

@app.post("/profile/update", response_model=models.UserInfo)
async def profile_update(
    user_info: models.UserInfo,
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    try:
        token = credentials.credentials
        user = auth_service._AuthService__decode_token(token)
        user_id = user['user_id']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    async with db.pool.acquire() as conn:
        current_users = await db.get_user_data_by_id(conn, user_id=user_id)
        if not current_users:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_user = dict(current_users[0])

        update_data = user_info.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field in current_user and value is not None:
                current_user[field] = value
        try:            
            await db.update_user_data_by_id(conn, user_id, models.UserInfo(**current_user))

            updated_user = await db.get_user_data_by_id(conn, user_id=user_id)
            return db.create_user_info(updated_user)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"profile_update error: {str(e)}")
#--------------------------------------------------------------------------------------  
# MESSAGES 
#--------------------------------------------------------------------------------------  
@app.post("/messages/add")
async def add_message(product_info: models.MessageSendInfo):
    async with db.pool.acquire() as conn:
        try:
            await db.add_message(conn, product_info)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Check sender ID - it must be a real person")

@app.get("/messages/get/from/{from_id}")
async def get_all_from_messages(from_id: int):
    async with db.pool.acquire() as conn:
        try:
            messages_res = await db.get_all_from_messages(conn, from_id)
            return db.create_message_info_list(messages_res)
        except Exception as e:
           raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")

@app.get("/messages/get/to/{from_id}")
async def get_all_to_messages(from_id: int):
    async with db.pool.acquire() as conn:
        try:
            messages_res = await db.get_all_to_messages(conn, from_id)
            return db.create_message_info_list(messages_res)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")

@app.post("/messages/get/user")
async def check_client_exists(request: models.ClientCheckRequest):
    async with db.pool.acquire() as conn:
        try:
            query = "SELECT check_client_exists($1)"
            result = await db.pool.fetchval(query, request.client_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"check_cient_exists: {str(e)}")
        if result is None:
            raise HTTPException(status_code=404, detail="Client not found")
        return {"exists": result}
    
@app.post("/messages/get/user")
async def check_client_exists(request: models.ClientCheckRequest):
    async with db.pool.acquire() as conn:
        try:
            exists = await db.check_client_exists(conn, request.client_id)
            return {"exists": exists}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"check_cient_exists: {str(e)}")
#--------------------------------------------------------------------------------------  
# MARKETS
#--------------------------------------------------------------------------------------  
@app.get("/market/get/all", response_model=models.MarketInfoList)
async def get_all_markets():
    async with db.pool.acquire() as conn:
        try:
            markets = await db.get_all_markets(conn)
            return models.MarketInfoList(lst=markets)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"failed to fetch markets:{str(e)}")        

@app.post("/market/update")
async def update_market(updated_market: models.MarketInfo):
    async with db.pool.acquire() as conn:
        try:
            await db.update_market(conn, updated_market)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.delete("/market/delete/{market_id}")
async def delete_market(market_id: int):
    async with db.pool.acquire() as conn:
        try:
            message = await db.delete_market(conn, market_id)
            return {"detail": message}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/market/get/{market_id}", response_model=models.MarketInfo)
async def get_market(market_id: int):
    async with db.pool.acquire() as conn:
        try:
            market_info = await db.get_market(conn, market_id)
            return market_info
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/market/add", response_model=models.MarketInfo)
async def create_default_market():
    async with db.pool.acquire() as conn:
        try:
            market_info = await db.create_default_market(conn)
            return market_info
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
#--------------------------------------------------------------------------------------  
# BACKUPS
#--------------------------------------------------------------------------------------  
@app.post("/backup/add")
async def backup_database():
    try:
        os.makedirs(BACKUP_DIR, exist_ok=True)
        current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

        backup_file = os.path.join(BACKUP_DIR, f"db_backup_{current_time}.dump")

        command = [
            "pg_dump",
            "--host", "db",  
            "--port", "5432",     
            "--username", "postgres",  
            "--dbname", "rumarkethub",   
            "--format=c",
            "--file", backup_file
        ]

        os.environ["PGPASSWORD"] = "postgres" 
        subprocess.run(command, check=True)

        return {"message": f"Backup created successfully at {backup_file}"}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/restore")
async def restore_database(backup: models.BackUpRequest):
    backup_filename = backup.filename
    try:

        backup_file = os.path.join(BACKUP_DIR, backup_filename)

        if not os.path.exists(backup_file):
            raise HTTPException(status_code=404, detail="Backup file not found")

        command = [
            "pg_restore",
            "--host", "db",  
            "--port", "5432",       
            "--username", "postgres", 
            "--dbname", "rumarkethub",
            "--if-exists",
            "--clean",
            backup_file
        ]

        os.environ["PGPASSWORD"] = "postgres"

        # with open(backup_file, "r") as file:
        #     subprocess.run(command, stdin=file, check=True)
        subprocess.run(command, check=True)

        return {"message": f"Database restored successfully from {backup_filename}"}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/backup/get/all", response_model=models.BackupsGetResponse)
async def get_backups():
    try:
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)  

        backup_files = [
            f for f in os.listdir(BACKUP_DIR) 
            if os.path.isfile(os.path.join(BACKUP_DIR, f))
        ]

        return models.BackupsGetResponse(backup_names_list=backup_files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backups: {str(e)}")
#--------------------------------------------------------------------------------------  
# TRADEPLACE
#--------------------------------------------------------------------------------------  
@app.get("/tradeplace/get/{marketid}/{id}", response_model=models.Tradeplace)
async def get_tradeplace(marketid: int, id: int):
    async with db.pool.acquire() as conn:
        try:
            tradeplace = await db.get_tradeplace(conn, marketid, id)
            return tradeplace
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/tradeplace/update/{marketid}/{id}")
async def update_tradeplace(marketid: int, id: int, updated_tradeplace: models.Tradeplace):
    async with db.pool.acquire() as conn:
        try:
            await db.update_tradeplace(conn, marketid, id, updated_tradeplace)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.delete("/tradeplace/delete/{marketid}/{id}")
async def delete_tradeplace(marketid: int, id: int):
    async with db.pool.acquire() as conn:
        try:
            message = await db.delete_tradeplace(conn, marketid, id)
            return {"detail": message}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
#--------------------------------------------------------------------------------------  
# CONTRACTS    
#--------------------------------------------------------------------------------------  
@app.get("/contract/get/all", response_model=models.ContractInfoList)
async def get_all_contracts():
    async with db.pool.acquire() as conn:
        try:
            contracts = await db.get_all_contracts(conn)
            return models.ContractInfoList(lst=contracts)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/contract/get/{user_id}", response_model=models.ContractInfoList)
async def get_all_contracts_concrete(user_id: int):
    async with db.pool.acquire() as conn:
        try:
            print(user_id)
            contracts = await db.get_all_contracts_concrete(conn, user_id)
            return models.ContractInfoList(lst=contracts)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
               

@app.delete("/contract/delete/{contract_id}")
async def delete_contract(contract_id: int):
    async with db.pool.acquire() as conn:
        try:
            message = await db.delete_contract(conn, contract_id)
            return {"detail": message}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/contract/add")
async def create_contract(contract: models.Contract):
    async with db.pool.acquire() as conn:
        try:
            await db.create_contract(conn, contract)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
#--------------------------------------------------------------------------------------      
@app.post("/event/add")
async def create_event(event: models.Event):
    async with db.pool.acquire() as conn:
        try:
            await db.create_event(conn, event)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/event/get/all")
async def get_events():
    async with db.pool.acquire() as conn:
        try:
            events = await db.get_all_events(conn)
            return models.EventList(lst=events)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.delete("/event/delete/{event_id}")
async def delete_event(event_id: int):
    async with db.pool.acquire() as conn:
        try:
            await db.delete_event(conn, event_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))