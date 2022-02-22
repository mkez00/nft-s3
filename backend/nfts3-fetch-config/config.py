import json
import os

def lambda_handler(event, context):
    
    account = os.environ['account']
    value = os.environ['value']
    
    response = {
        "account": account,
        "value": value
    }
    
    return response
