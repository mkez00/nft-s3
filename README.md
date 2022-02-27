# Overview

nft-s3 is a platform that allows clients to create a ERC-721 (NFT) tokens on an EVM based chain that stores the token's metadata in a centralized repo (S3).  The project is live and can be found [here](https://thequicknft.com)

# Requirements and Workflow

The requirements of the project were as follows:

- Create a front end (React) that will create a smart contract (ERC-721) and also create associated metadata (json and image) using the application's backend
- The backend provides a minimal value required in order to store the metadata in the central repo (AWS)
- The smart contract will include additional properties: Value provided, Account that was given the value.  These will be used during validation when processing the associated NFT metadata

<img src="https://mk-nft-token-document.s3.amazonaws.com/nft-s3-process-chart.jpg" alt="Application workflow"></img>

# Architecture

<img src="https://mk-nft-token-document.s3.amazonaws.com/nfts3-architecture.jpg" alt="Architecture"></img>

## Centralized Components (AWS)

The centralized components of the application use AWS services.  The services in use are as follows:
- S3 for metadata (json) and image storage
- Lambda for providing configuration information to client: Broker address and Cost for example
- API gateway to host the API (JSON RPC)
- CloudFront to serve the React frontend

## Decentralized Components

The decentralized components of the application include a smart contract that implements the ERC-721 interface ([OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts)).  The ideal blockchain to run this application on is [Polygon](https://polygon.technology/).  The use of a Web3 enabled wallet that supports the Polygon RPS is required as well (Metamask, Coinbase, etc.)


