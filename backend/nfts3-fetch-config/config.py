import json
import os

def lambda_handler(event, context):
    
    account = os.environ['account']
    value = os.environ['value']
    blockchain_provider = os.environ['blockchain_provider']
    base_token_uri = os.environ['base_token_uri']
    
    response = {
        "account": account,
        "value": value,
        "blockchain_provider": blockchain_provider,
        "base_token_uri": base_token_uri
    }
    
    return response