/**
 * nfts3-process-nft
 * 
 * After the client creates the smart contract (ERC 721), the contract will include:
 * 
 * Name (ERC 721)
 * Symbol (ERC 721)
 * TokenURI (ERC 721) - Generated in create call.  Pointing to a URL of JSON object that currently does not exist.  Will be created here
 * Broker - The owner account that owns the application (ie.  mkez00)
 * Value - The amount the contract creator paid to have the contract deployed
 * 
 * This function will create the NFT metadata (JSON) and put it in the designated TokenURI (a specific file in S3)
 * 
 * @param {*} event 
 * @returns 
 */

exports.handler = async (event, context) => {

    const contractId = event["contractId"];
    const account = process.env.account;
    const valueRequired = process.env.value;
    const provider = process.env.blockchain_provider;
    
    // connect to provider specified in Env
    const Web3Lib = require('web3');
    const web3Provider = new Web3Lib.providers.HttpProvider(provider);
    const web3 = new Web3Lib(web3Provider);
    
    // set Contract provided by client
    const contract = new web3.eth.Contract(abi, contractId);

    // fetch broker and value paid
    const broker = await contract.methods.Broker().call();
    const valuePaid = await contract.methods.Value().call();

    // determine if contract provided and value provided are valid
    let validTransaction = false;
    if (broker!=account || valuePaid < valueRequired){
        return context.fail("[BadRequest] Transaction is not valid")
    }

    // check if S3 object exists.  If not, only allow one transaction per contract
    const tokenUri = await contract.methods.tokenURI("1").call();
    if (tokenUri!=null){
        const axios = require('axios');
        try {
            const response = await axios.get(tokenUri)
            // 200 response means the file exists, thus not a valid transaction
            if (response.status==200){
                validTransaction = false;
            } else {
                validTransaction = true;
            }
        } catch (error) {
            validTransaction = true;
        }

         // if a valid transaction 
        if (validTransaction){
            const AWS = require('aws-sdk');
            const s3 = new AWS.S3();

            // 1. generate filename for image that was uploaded.  Upload image to S3
            const uuid = require("uuid")
            const type = event["image"].split(';')[0].split('/')[1]; //get image type
            const filename = uuid.v1() + "." + type //build filename
            const base64Data = new Buffer.from(event["image"].replace(/^data:image\/\w+;base64,/, ""), 'base64');

            const params2 = {
                Bucket: process.env.bucket,
                Key: filename,
                ContentEncoding: 'base64',
                Body: base64Data,
                ContentType: 'image/${type}'
            };

            let imageLocation = ""
            try {
                const stored = await s3.upload(params2).promise()
                imageLocation = stored["Location"]
                console.log(stored["Location"])
            } catch (err) {
                console.log(err)
            }

            /**
             * 2. Build nft metadata
             * 
             * image: URL to s3 bucket from 1
             * name: provided from client
             * description: provided from client
             * 
             */
            const metadataContent = {
                name: event["name"],
                description: event["description"],
                image: imageLocation
            };
            console.log(metadataContent)

            const s3ParseUrl = require('s3-url-parser');
            const { bucket, key } = s3ParseUrl(tokenUri);

            //3. connect to S3 and upload .json file to this bucket
            const params = {
                Bucket: bucket,
                Key: key,
                ContentType: "application/json",
                Body: JSON.stringify(metadataContent, null, '\t')
            };

            try {
                const stored = await s3.upload(params).promise()
                console.log(stored["Location"])
            } catch (err) {
                console.log(err)
            }
           
			const response = {
				broker: broker,
				valuePaid: valuePaid,
				validTransaction: validTransaction,
				tokenUri: tokenUri
			};
			return response;
        }
    }
    
    return context.fail("[BadRequest] An error occurred")
};

const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tokenURI_",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "broker_",
				"type": "address"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "Broker",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "Value",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]