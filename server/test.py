from datetime import datetime

from azure.cosmosdb.table.models import Entity
from azure.cosmosdb.table.tableservice import TableService

account_name = "devstoreaccount1"
account_key = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="

table_service = TableService(account_name=account_name, account_key=account_key, is_emulated=True)
#table_service.delete_table('Messages')
#table_service.create_table('Messages')

#message = {'PartitionKey': str(2), 
#        'RowKey': str(int(datetime.utcnow().timestamp()*10000000)),
#        'MessageContents': 'This is the first message in Piqued! -Nick T',
#        'Deleted': 0,
#        'UserId': 0,
#        'Assets': "",
#        'ModifiedAt': datetime.utcnow()}
#table_service.insert_entity('Messages', message)

# Query the message:
msgs = table_service.query_entities('Messages', filter="PartitionKey eq 'lolz'")
for msg in msgs:
    print(msg.MessageContents)
    print(msg)
