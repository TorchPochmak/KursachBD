import base64
from asyncpg import Connection, create_pool
import json
from models import UserInfo
from models import MessageSendInfo
import models

class Database:
    def __init__(self, config_path: str):
        with open(config_path, 'r') as config_file:
            self.config = json.load(config_file)['database']
        self.pool = None
        self.connect()

    async def connect(self):
        self.pool = await create_pool(
            user=self.config['user'],
            password=self.config['password'],
            database=self.config['dbname'],
            host=self.config['host'],
            port=self.config['port']
        )


#REGISTER AND LOGIN AND PROFILE
#--------------------------------------------------------------------------------------       
    
    async def get_user_by_email(self, conn, email: str) -> dict:
        return await conn.fetch(
            'SELECT * FROM get_user_by_email($1);', email
        )
    
    async def add_new_user(self, conn, email: str, hashed_password: str) -> dict:
        await conn.execute(
            'CALL add_new_user($1, $2);', email, hashed_password
        )

    async def get_user_data_by_id(self, conn, user_id):
        return await conn.fetch(
            'SELECT * FROM get_user_data_by_id($1);', user_id
        )
    
    async def update_user_data_by_id(self, conn, user_id, updated_data: UserInfo):
        await conn.execute(
            """
            CALL update_user_data(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )
            """,
            user_id,
            updated_data.client_username,
            updated_data.client_email,
            updated_data.client_is_admin,
            updated_data.client_phone_number,
            updated_data.person_organization,
            updated_data.person_first_name,
            updated_data.person_last_name,
            updated_data.person_patronymic,
            updated_data.person_citizenship,
            updated_data.person_description
        )
#--------------------------------------------------------------------------------------         
# MESSAGES
#--------------------------------------------------------------------------------------       
    async def add_message(self, conn, product_info: MessageSendInfo):
        query = """
        CALL add_message(
            $1, $2, $3, $4
        );
        """
        return await conn.execute(
            query,
            product_info.fromId,
            product_info.toId,
            product_info.theme,
            product_info.subject
        )
    
    async def get_all_from_messages(self, conn, from_id):
        return await conn.fetch(
            'SELECT * FROM get_all_from_messages($1);', from_id
        )

    async def get_all_to_messages(self, conn, to_id):
        return await conn.fetch(
            'SELECT * FROM get_all_to_messages($1);', to_id
        )

    async def check_client_exists(self, conn, client_id):
        query = "SELECT check_client_exists($1)"
        try:
            result = await conn.fetchval(query, client_id)
            if result is None:
                raise ValueError("Client not found")
            return result
        except Exception as e:
            raise Exception(f"check_client_exists: {str(e)}")
#--------------------------------------------------------------------------------------       
# MARKETS
#--------------------------------------------------------------------------------------       
    async def get_all_markets(self, conn):
        rows = await conn.fetch('SELECT * FROM get_all_markets();')
        return [models.MarketInfo(
            id=row['id'],
            name=row['name'],
            schemepng=row['schemepng'],
            isopened=row['isopened'],
            placescount=row['placescount'],
            ownerid=row['ownerid'],
            address=row['address']
        ) for row in rows]

    async def update_market(self, conn, market_info):
        await conn.execute(
            'CALL update_market($1, $2, $3, $4, $5, $6, $7);',
            market_info.id, market_info.name, market_info.schemepng,
            market_info.isopened, market_info.placescount,
            market_info.ownerid, market_info.address
        )

    async def get_market(self, conn, market_id):
        row = await conn.fetchrow('SELECT * FROM get_market($1);', market_id)
        if row:
            return models.MarketInfo(
                id=row['id'],
                name=row['name'],
                schemepng=row['schemepng'],
                isopened=row['isopened'],
                placescount=row['placescount'],
                ownerid=row['ownerid'],
                address=row['address']
            )
        else:
            raise ValueError("Market not found")

    async def delete_market(self, conn, market_id):
        try:
            await conn.execute('CALL delete_market($1);', market_id)
            return "Market deleted successfully"
        except Exception as e:
            if "Market not found" in str(e):
                raise ValueError("Market not found")
            raise Exception(f"Failed to retrieve market: {str(e)}")
         
    async def create_default_market(self, conn):
        try:
            # Вызов хранимой функции
            row = await conn.fetchrow('SELECT id, name, schemepng, isopened, placescount, ownerid, address FROM create_default_market();')
            if row:
                return models.MarketInfo(
                    id=row['id'],
                    name=row['name'],
                    schemepng=row['schemepng'],
                    isopened=row['isopened'],
                    placescount=row['placescount'],
                    ownerid=row['ownerid'],
                    address=row['address']
                )
        except Exception as e:
            raise Exception(f"Failed to create market: {str(e)}")   
#--------------------------------------------------------------------------------------       
# TRADEPLACE
#--------------------------------------------------------------------------------------  
    async def get_tradeplace(self, conn, marketid, id):
        try:
            tradeplace = await conn.fetchrow('SELECT * FROM get_or_create_tradeplace($1, $2);', marketid, id)
            return models.Tradeplace(**tradeplace)
        except Exception as e:
            raise Exception(f"Error in getting tradeplace info: {str(e)}")
    
    async def update_tradeplace(self, conn, marketid, id, updated_tradeplace):
        try:
            await conn.execute(
                'CALL update_tradeplace($1, $2, $3, $4, $5);',
                updated_tradeplace.marketid, updated_tradeplace.marketnumber,
                updated_tradeplace.price, updated_tradeplace.info,
                updated_tradeplace.ownerid
            )
        except ValueError as e:
            raise Exception("Tradeplace not found")
        except Exception as e:
            raise Exception(f"Failed to update tradeplace: {str(e)}")
    
    async def delete_tradeplace(self, conn, marketid, id):
        try:
            await conn.execute('CALL delete_tradeplace($1, $2);', marketid, id)
            return "Tradeplace deleted successfully"
        except ValueError as e:
            raise Exception("Tradeplace not found")
        except Exception as e:
            raise Exception(f"Failed to delete tradeplace: {str(e)}")
#--------------------------------------------------------------------------------------       
# CONTRACTS
#--------------------------------------------------------------------------------------   
    async def get_all_contracts(self, conn):
        try:
            rows = await conn.fetch('SELECT * FROM get_all_contracts();')
            return [
                models.ContractInfo(
                    id=row['id'],
                    marketid=row['marketid'],
                    marketnumber=row['marketnumber'],
                    tenantid=row['tenantid'],
                    datecreated=row['datecreated'],
                    dayscount=row['dayscount'],
                    price=row['price'],
                    info=row['info'],
                    ownerid=row['ownerid']
                ) for row in rows
            ]
        except Exception as e:
            raise Exception(f"Failed to fetch contracts: {str(e)}")
        
    async def get_all_contracts_concrete(self, conn, id):
        try:
            rows = await conn.fetch('SELECT * FROM get_all_contracts_concrete($1);', id)
            return [
                models.ContractInfo(
                    id=row['id'],
                    marketid=row['marketid'],
                    marketnumber=row['marketnumber'],
                    tenantid=row['tenantid'],
                    datecreated=row['datecreated'],
                    dayscount=row['dayscount'],
                    price=row['price'],
                    info=row['info'],
                    ownerid=row['ownerid']
                ) for row in rows
            ]
        except Exception as e:
            raise Exception(f"Failed to fetch contracts: {str(e)}")    

    async def delete_contract(self, conn, contract_id):
        try:
            await conn.execute('CALL delete_contract($1);', contract_id)
            return "Contract deleted successfully"
        except ValueError as e:
            raise Exception("Contract not found")
        except Exception as e:
            raise Exception(f"Failed to delete contract: {str(e)}")

    async def create_contract(self, conn, contract):
        try:
            await conn.execute(
                'CALL create_contract($1, $2, $3, $4, $5);',
                contract.marketid, contract.marketnumber, contract.tenantid,
                contract.datecreated, contract.dayscount
            )
        except Exception as e:
            raise Exception(f"Failed to create contract: {str(e)}")
#--------------------------------------------------------------------------------------  
# EVENTS     
#--------------------------------------------------------------------------------------  
    async def delete_event(self, conn, event_id):
        try:
            await conn.execute('CALL delete_event($1);', event_id)
            return "Event deleted successfully"
        except ValueError as e:
            raise Exception("Event not found")
        except Exception as e:
            raise Exception(f"Failed to delete an event: {str(e)}")

    async def get_all_events(self, conn):
        try:
            rows = await conn.fetch('SELECT * FROM get_all_events();')
            return [
                models.Event(
                    EventId=row['eventid'],
                    OwnerId=row['ownerid'],
                    EventName=row['eventname'],
                    Description=row['description'],
                    StartDate=row['startdate'],
                    EndDate=row['enddate'],
                ) for row in rows
            ]
        except Exception as e:
            raise Exception(f"Failed to get events: {str(e)}")

    async def create_event(self, conn, event):
        try:
            await conn.execute(
                'CALL create_event($1, $2, $3, $4, $5);',
                event.EventName, event.OwnerId, event.Description,
                event.StartDate, event.EndDate
            )
        except Exception as e:
            raise Exception(f"Failed to create event. Check ownerId: {str(e)}")
#--------------------------------------------------------------------------------------       
# OTHER
    def create_message_info(self, item):
        return models.MessageInfo(
            from_id=item['from_id'],
            to_id=item['to_id'],
            date=item['date_created'],
            theme=item['theme'],
            subject=item['subject']
        )

    def create_message_info_list(self, item):
        result = []
        if(not item):
            return models.MessageInfoList(
            lst=result
        )
        for it in item:
            result.append(self.create_message_info(it))
        return models.MessageInfoList(
            lst=result
        )
    #!Done
    def create_user_info(self, item):
        return models.UserInfo(
                client_id=item[0].get('client_id'),
                client_username=item[0].get('client_username'),
                client_email=item[0].get('client_email'),
                client_is_admin=item[0].get('client_is_admin'),
                client_phone_number=item[0].get('client_phone_number'),
                person_id=item[0].get('person_id'),
                person_organization=item[0].get('person_organization'),
                person_first_name=item[0].get('person_first_name'),
                person_last_name=item[0].get('person_last_name'),
                person_patronymic=item[0].get('person_patronymic'),
                person_citizenship=item[0].get('person_citizenship'),
                person_description=item[0].get('person_description')
            ) 
