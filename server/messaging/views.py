from rest_framework.decorators import api_view
from rest_framework.response import Response
import uuid
from azure.cosmosdb.table.tableservice import TableService
from django.conf import settings
from datetime import datetime

# Create your views here.
@api_view(['POST'])
def delete(request):
    rowKey = request.data["rowKey"]
    partitionKey = request.data["partitionKey"]
    
    table_service = TableService(        
        account_name=settings.AZURE_STORAGE_ACCOUNT_NAME, account_key=settings.AZURE_STORAGE_ACCOUNT_KEY
    )
    try:
        if not table_service.exists('Messages'):
            table_service.create_table('Messages')
    except:
        # ignoring if someone else created it between exists <-> create
        if not table_service.exists('Messages'):
            raise

    msg = {'PartitionKey': partitionKey, 
        'RowKey': rowKey,
        'deleted': 1,
        'modifiedAt': datetime.utcnow()
    }
    table_service.merge_entity('Messages', msg)
    return Response({"status": "Deleted"})
