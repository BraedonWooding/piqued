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

TOK='TODO: TOK'

table_service = TableService(
    account_name="piqued", account_key="TODO: ACCOUNT_KEY"
)

for e in table_service.query_entities('Messages', filter=f"PartitionKey eq '{208}' and deleted eq 0"):
    table_service.delete_entity('Messages', str(208), e['RowKey'])

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

# send_msg(220, 208, "Hey!", None, None)
send_msg(220, 208, "We are going to miss the demo :O", None, None)
send_msg(207, 208, "I think it's started!", "DOMAIN/assets/demo/51012908.png", "image/png")
send_msg(228, 208, "Have a look at this!", "DOMAIN/assets/demo/file-sample_100kB.docx", WORD)
send_msg(228, 208, "Or this!", "DOMAIN/assets/demo/file_example_XLSX_50.xlsx", XSLX)
send_msg(227, 208, "I'm coming!!", "DOMAIN/assets/demo/giphy.gif", "image/gif")
send_msg(227, 208, "Even pdfs", "DOMAIN/assets/demo/Vibe.pdf", "application/pdf")
send_msg(227, 208, "The code is done!  It's all nice now", "DOMAIN/assets/demo/serializers.py", "code")
send_msg(227, 208, "We are going to take this to the moon", "DOMAIN/assets/demo/file_example_MP4_1280_10MG.mp4", "video/mp4")
