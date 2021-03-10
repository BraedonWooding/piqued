import time
from azure.cosmosdb.table.tableservice import TableService

# Print progress
def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()

try:
    account_name = "devstoreaccount1"
    account_key = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
    table_service = TableService(account_name=account_name, account_key=account_key, is_emulated=True)
    table_service.create_table('Messages')

    # A List of Items
    items = list(range(0, 57))
    l = len(items)

    # Initial call to print 0% progress
    printProgressBar(0, l, prefix = 'Progress:', suffix = 'Complete', length = 50)
    for i, item in enumerate(items):
        time.sleep(0.1)
        # For anyone reading this, the loading bar is useless - it just looks really cool :D
        printProgressBar(i + 1, l, prefix = 'Progress:', suffix = 'Complete', length = 50)
except:
    print("ERROR: Installation Failed")
