#!/usr/bin/python

from datetime import datetime, timezone

import requests

from azure.cosmosdb.table.tableservice import TableService

BASE_URL = 'DOMAIN'
PATH = BASE_URL + '/messaging/api-send'

IMG='image/png'
PDF='application/pdf'
WORD='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
XSLX='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

TOK='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE5MDc1Mzc3LCJqdGkiOiI4NThiY2I4NzQxZmY0NGVhYTY5ZjliM2E2NmEwMTM5NiIsInVzZXJfaWQiOjF9.rWCejj2hhUJgfpFlDEEwe4Cv-17vVfXpN8ffve6VGA8'

table_service = TableService(
    account_name="piqued", account_key="TODO: ACCOUNT_KEY"
)

for e in table_service.query_entities('Messages', filter=f"PartitionKey eq '{206}' and deleted eq 0"):
    table_service.delete_entity('Messages', str(206), e['RowKey'])

def send_msg(user_id, group_id, msg, file, fileType):
    message = {
        "message": msg,
        "type": "chat_message",
        "PartitionKey": str(group_id),
        "RowKey": str(int(datetime.now(timezone.utc).timestamp() * 10000000)),
        "createdAt": datetime.now(timezone.utc),
        "files": f'[{{ "url": "{file}", "type": "{fileType}" }}]' if file else "[]",
        "userId": user_id,
        "deleted": 0,
        "seen": "",
        "message": msg
    }
    print(requests.post(PATH, message, headers = { "Authorization": "Bearer " + TOK, "x-App-Key": "TODO: APP KEY" }).content)
    table_service.insert_or_replace_entity("Messages", message)

send_msg(220, 206, "Hey Nicholas wake up??", None, None)
send_msg(220, 206, "We are going to miss the demo :O", None, None)
send_msg(207, 206, "I think it's started!", "DOMAIN/assets/demo/51012908.png", "image/png")
send_msg(228, 206, "", None, None)
send_msg(227, 206, "I'm coming!!", "DOMAIN/assets/demo/giphy.gif", None)
