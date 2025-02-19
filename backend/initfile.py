from typing import List, Optional
import asyncio
from random import choice, randint
from database import Database
import models
from fastapi import Depends, FastAPI, HTTPException, Response, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Body
from auth import AuthService
import os
import base64
from PIL import Image
import io
import random
from datetime import datetime

db = Database(config_path="fillingConfig.json")
auth_service = AuthService(config_path="fillingConfig.json", db=db)
auth_scheme = HTTPBearer()

# Имена для генерации
first_names = ["Alice", "Bob", "Charlie", "David", "Eve"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones"]
patronymics = ["James", "Marie", "Lee", "Alex", "Taylor"]
organizations = ["Kaspersky", "Google", "Amazon", "Microsoft", "Apple"]
countries = ["USA", "UK", "Germany", "France", "Japan"]


users = [
    ['a@aa.aa', '123'],
    ['b@bb.bb', '123'],
    ['c@cc.cc', '123'],
    ['d@dd.dd', '123'],
    ['e@ee.ee', '123']
]
# Информация о маркете (названия, количество мест и адреса)
markets_info = [
    {"name": "Bazar hub", "placescount": 20, "address": "Ulitsa Lenina, 11"},
    {"name": "Plaza of wisdom", "placescount": 22, "address": "Cute Prospect, 90"},
    {"name": "Tochka kartoshki", "placescount": 23, "address": "Moscow Avenue, 73"},
    {"name": "Chto za ogurets!", "placescount": 28, "address": "Kursachev Pereulok, 2"},
    {"name": "Podhodi, ne otoidi!", "placescount": 36, "address": "Helpov Proezd, 42"}
]

tradeplaces_info = [
    {"price": 100.00, "info": "Small booth with great visibility"},
    {"price": 150.00, "info": "Near the main entrance"},
    {"price": 200.00, "info": "Corner spot"},
    {"price": 250.00, "info": "Central location"},
    {"price": 300.00, "info": "Adjacent to the cafe area"},
    {"price": 350.00, "info": "Prime location next to popular store"},
    {"price": 400.00, "info": "Second floor with good foot traffic"},
    {"price": 450.00, "info": "High demand area with lots of visibility"},
    {"price": 500.00, "info": "Exclusive VIP spot"},
    {"price": 550.00, "info": "Close to elevators and amenities"},
    {"price": 600.00, "info": "Spacious area perfect for events"},
    {"price": 650.00, "info": "Near customer service desk"},
    {"price": 700.00, "info": "Right next to food court"},
    {"price": 750.00, "info": "Main corridor with heavy traffic"},
    {"price": 800.00, "info": "Close to high-end brands"},
    {"price": 850.00, "info": "Quiet area ideal for relaxed shopping"},
    {"price": 900.00, "info": "Opposite a children's play area"},
    {"price": 950.00, "info": "Perfect location for tech stores"},
    {"price": 1000.00, "info": "Sought-after location near entrance"},
    {"price": 1050.00, "info": "Near business center and conference rooms"}
]

messages_info = [
    {"fromId": 1, "toId": 2, "theme": "Project Collaboration", "subject": "Let's discuss the new project collaboration details."},
    {"fromId": 2, "toId": 1, "theme": "Feedback Request", "subject": "Could you please provide feedback on the recent proposal?"},
    {"fromId": 1, "toId": 3, "theme": "Schedule Meeting", "subject": "Can we schedule a meeting to discuss our next steps?"},
    {"fromId": 3, "toId": 1, "theme": "Meeting Confirmation", "subject": "Confirming our meeting schedule for next week."},
    {"fromId": 2, "toId": 4, "theme": "New Ideas", "subject": "Would love to hear your thoughts on new marketing strategies."},
    {"fromId": 4, "toId": 2, "theme": "Strategy Session", "subject": "Planning to have a session to define our strategy."},
    {"fromId": 3, "toId": 5, "theme": "Weekly Update", "subject": "Attached is our weekly update report."},
    {"fromId": 5, "toId": 3, "theme": "Great Job!", "subject": "Excellent work on the recent project completion."},
    {"fromId": 4, "toId": 5, "theme": "Networking Opportunity", "subject": "Join us at the networking event this Friday."},
    {"fromId": 5, "toId": 4, "theme": "Re: Networking Opportunity", "subject": "Thanks for the invite! I'll be there."},
    {"fromId": 1, "toId": 5, "theme": "Annual Review", "subject": "Please take a look at the annual review document."},
    {"fromId": 5, "toId": 1, "theme": "Reply to Annual Review", "subject": "Reviewed the document, looks good to me."},
    {"fromId": 2, "toId": 3, "theme": "Billing Inquiry", "subject": "What's the status of the last month's billing?"},
    {"fromId": 3, "toId": 2, "theme": "Re: Billing Inquiry", "subject": "I'll check with the finance team and get back to you."},
    {"fromId": 4, "toId": 1, "theme": "Vacation Plan", "subject": "Informing you about my vacation plan for next month."},
    {"fromId": 1, "toId": 4, "theme": "Re: Vacation Plan", "subject": "Thanks for the heads-up! Enjoy your vacation."},
    {"fromId": 1, "toId": 2, "theme": "Event Planning", "subject": "Let's discuss planning for the upcoming event."},
    {"fromId": 2, "toId": 3, "theme": "Task Prioritization", "subject": "Could you prioritize these tasks first thing?"},    
    {"fromId": 3, "toId": 4, "theme": "Urgent Request", "subject": "Please address this urgent request at your earliest."},
    {"fromId": 4, "toId": 5, "theme": "Follow Up", "subject": "Following up on our last conversation."}
]
contracts_info = [
    {"marketid": 1, "marketnumber": 1, "tenantid": 2, "datecreated": "2023-11-01T09:00:00", "dayscount": 30},
    {"marketid": 1, "marketnumber": 2, "tenantid": 3, "datecreated": "2023-11-02T10:00:00", "dayscount": 31},
    {"marketid": 1, "marketnumber": 3, "tenantid": 4, "datecreated": "2023-11-03T11:00:00", "dayscount": 32},
    {"marketid": 1, "marketnumber": 4, "tenantid": 5, "datecreated": "2023-11-04T12:00:00", "dayscount": 33},
    {"marketid": 1, "marketnumber": 5, "tenantid": 3, "datecreated": "2023-11-05T13:00:00", "dayscount": 34},
    {"marketid": 2, "marketnumber": 6, "tenantid": 1, "datecreated": "2023-11-06T14:00:00", "dayscount": 35},
    {"marketid": 2, "marketnumber": 7, "tenantid": 3, "datecreated": "2023-11-07T15:00:00", "dayscount": 36},
    {"marketid": 2, "marketnumber": 8, "tenantid": 4, "datecreated": "2023-11-08T16:00:00", "dayscount": 37},
    {"marketid": 2, "marketnumber": 9, "tenantid": 5, "datecreated": "2023-11-09T17:00:00", "dayscount": 38},
    {"marketid": 3, "marketnumber": 10, "tenantid": 1, "datecreated": "2023-11-10T18:00:00", "dayscount": 39},
    {"marketid": 3, "marketnumber": 11, "tenantid": 2, "datecreated": "2023-11-11T09:00:00", "dayscount": 40},
    {"marketid": 3, "marketnumber": 12, "tenantid": 4, "datecreated": "2023-11-12T10:00:00", "dayscount": 41},
    {"marketid": 3, "marketnumber": 13, "tenantid": 5, "datecreated": "2023-11-13T11:00:00", "dayscount": 42},
    {"marketid": 4, "marketnumber": 14, "tenantid": 1, "datecreated": "2023-11-14T12:00:00", "dayscount": 43},
    {"marketid": 4, "marketnumber": 15, "tenantid": 2, "datecreated": "2023-11-15T13:00:00", "dayscount": 44},
    {"marketid": 4, "marketnumber": 16, "tenantid": 3, "datecreated": "2023-11-16T14:00:00", "dayscount": 45},
    {"marketid": 4, "marketnumber": 17, "tenantid": 5, "datecreated": "2023-11-17T15:00:00", "dayscount": 46},
    {"marketid": 5, "marketnumber": 18, "tenantid": 1, "datecreated": "2023-11-18T16:00:00", "dayscount": 47},
    {"marketid": 5, "marketnumber": 19, "tenantid": 2, "datecreated": "2023-11-19T17:00:00", "dayscount": 48},
    {"marketid": 5, "marketnumber": 20, "tenantid": 3, "datecreated": "2023-11-20T18:00:00", "dayscount": 49}
]

events_info = [
    {"EventId": 1, "EventName": "Tech Conference", "Description": "An event to explore the latest in tech.", "OwnerId": 1, "StartDate": "2023-11-01T09:00:00", "EndDate": "2023-11-01T17:00:00"},
    {"EventId": 2, "EventName": "Marketing Workshop", "Description": "Learn the latest marketing strategies.", "OwnerId": 2, "StartDate": "2023-11-03T10:00:00", "EndDate": "2023-11-03T14:00:00"},
    {"EventId": 3, "EventName": "Annual General Meeting", "Description": "Shareholder updates and future plans.", "OwnerId": 3, "StartDate": "2023-11-08T09:00:00", "EndDate": "2023-11-08T15:00:00"},
    {"EventId": 4, "EventName": "Networking Brunch", "Description": "A casual networking event to meet peers.", "OwnerId": 4, "StartDate": "2023-11-10T11:00:00", "EndDate": "2023-11-10T13:00:00"},
    {"EventId": 5, "EventName": "Product Launch", "Description": "Unveiling of our latest product line.", "OwnerId": 5, "StartDate": "2023-11-15T10:00:00", "EndDate": "2023-11-15T12:00:00"},
    {"EventId": 6, "EventName": "Startup Pitch", "Description": "Pitch your startup ideas to investors.", "OwnerId": 1, "StartDate": "2023-11-18T14:00:00", "EndDate": "2023-11-18T17:00:00"},
    {"EventId": 7, "EventName": "Coding Bootcamp", "Description": "Intensive bootcamp to improve coding skills.", "OwnerId": 2, "StartDate": "2023-11-20T09:00:00", "EndDate": "2023-11-20T17:00:00"},
    {"EventId": 8, "EventName": "End of Year Party", "Description": "Celebrate the end of the year with us.", "OwnerId": 3, "StartDate": "2023-11-22T18:00:00", "EndDate": "2023-11-22T21:00:00"},
    {"EventId": 9, "EventName": "Leadership Summit", "Description": "Discuss leadership strategies and growth.", "OwnerId": 4, "StartDate": "2023-11-25T10:00:00", "EndDate": "2023-11-25T16:00:00"},
    {"EventId": 10, "EventName": "Art Expo", "Description": "Showcasing local artists and their work.", "OwnerId": 5, "StartDate": "2023-11-28T10:00:00", "EndDate": "2023-11-28T17:00:00"}
]

def get_image_base64(filename):
    try:
        with Image.open(filename) as img:
            img_bytes_io = io.BytesIO()
            img.save(img_bytes_io, format='GIF') 
            # Кодировать в Base64
            img_base64 = base64.b64encode(img_bytes_io.getvalue()).decode("ascii")
            return img_base64
    except Exception as e:
        print(f"Ошибка при чтении и преобразовании изображения: {str(e)}")
        return None

# Генерация информации о пользователях
userinfo = [
    models.UserInfo(
        client_username=f"{first_names[i].lower()}{randint(100, 999)}",
        client_email=users[i][0],
        client_is_admin=(i == 0),  # предположим, что только первый является администратором
        client_phone_number=f"{randint(100, 999)}-555-{randint(1000, 9999)}",
        person_organization=choice(organizations),
        person_first_name=first_names[i],
        person_last_name=last_names[i],
        person_patronymic=choice(patronymics),
        person_citizenship=choice(countries),
        person_description=f"{first_names[i]} is a professional working in {organizations[i]}.",
        client_id=None,   # Убедитесь, что это значение ожидаемо
        person_id=None    # Убедитесь, что это значение ожидаемо
    )
    for i in range(5)
]



async def begin(db: Database):
    await db.connect()
    async with db.pool.acquire() as conn:
        for i, user in enumerate(users):
            email = user[0]
            hashed_password = auth_service._AuthService__hash_password(user[1])

            # Создание нового пользователя
            await db.add_new_user(conn, email, hashed_password)
            print(f"Added user: {email}")

            # Обновление информации о пользователе
            updated_data = userinfo[i]
            print(updated_data)
            await db.update_user_data_by_id(conn, i + 1, updated_data)
            print(f"Updated user info for: {email}")

            await db.create_default_market(conn)
            # Создание торгового рынка для каждого пользователя
            image_bytes = get_image_base64(f"../resources/{i+1}.gif")
            market_info_data = markets_info[i]
            market_info = models.MarketInfo(
                id=i + 1,  # этот будет установлен базой данных
                name=market_info_data["name"],
                schemepng=image_bytes,
                isopened=True,
                placescount=market_info_data["placescount"],
                ownerid=i + 1,
                address=market_info_data["address"]
            )
            await db.update_market(conn, market_info)
            print(f"Created market for user {email}")

            for tradeplace_number, tradeplace_data in enumerate(tradeplaces_info, start=1):
                await db.get_tradeplace(conn, market_info.id, tradeplace_number)
                tradeplace = models.Tradeplace(
                    marketid=market_info.id,
                    marketnumber=tradeplace_number,
                    price=tradeplace_data['price'],
                    info=tradeplace_data['info'],
                    ownerid=i + 1
                )
                await db.update_tradeplace(conn, market_info.id, tradeplace_number, tradeplace)
                print(f"Created tradeplace {tradeplace_number} for market {market_info.id}")
        for message_data in messages_info:
                message_info = models.MessageSendInfo(**message_data)
                await db.add_message(conn, message_info)
        for contract_data in contracts_info:
                contract = models.Contract(**contract_data)
                await db.create_contract(conn, contract)
                print(f"Created contract: MarketID {contract.marketid}, MarketNumber {contract.marketnumber}, TenantID {contract.tenantid}")
        for event_data in events_info:
                event = models.Event(**event_data)
                await db.create_event(conn, event)
                print(f"Created event: {event.EventName} with OwnerID {event.OwnerId}")
        
            
asyncio.run(begin(db))