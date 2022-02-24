import './Form.css'
import { useState, useEffect } from 'react'
import {v1} from 'uuid'
import Web3 from 'web3'

function Form(props){

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftSymbol, setNftSymbol] = useState("");
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [processingStatus, setProcessingStatus] = useState();

  useEffect(() => {
    async function load() {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      let abi = require('./abi.json')
      let contract = new web3.eth.Contract(abi)
      setContract(contract)
      setProcessingStatus("")
    }
    
    load();
   }, []);

  const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
	};
  

  let handleSubmit = async (e) => {
    e.preventDefault();
    setProcessingStatus("Processing smart contract")

    let byteCode = require('./byteCode.json')
    let tokenUri = props.baseUri + v1() + ".json"
    
    console.log("Processing smart contract")
    const contractResult = await contract.deploy({data:byteCode.object,arguments:[nftName, nftSymbol, tokenUri, props.broker]}).send(
      {
        from: account,
        value: props.value,
      }
    )

    console.log("Processing NFT metadata")
    setProcessingStatus("Processing NFT Metadata")
    let imageBase64 = ''  
    getBase64(selectedFile, async (result) => {
      imageBase64 = result;
  
      let res = await fetch("https://api.thequicknft.com/process", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          description: description,
          contractId: contractResult.options.address,
          image: imageBase64
        }),
      });
      let resJson = await res.json();
      if (res.status === 200) {
        console.log("User created successfully");
        setProcessingStatus("NFT Created Successfully: " + contractResult.options.address)
      } else {
        console.log("Some error occured");
        setProcessingStatus("Error processing request")
      }

    });
    
  }

  return (
    <div className="container">
      <p>{processingStatus}</p>
      <form onSubmit={handleSubmit}>
        <ul className="flex-outer">
          <li>
            <label htmlFor="nft-name">NFT Name</label>
            <input type="text" id="nft-name" placeholder="Enter the NFT Name here" onChange={(e) => setNftName(e.target.value)} />
          </li>
              <li>
                <label htmlFor="nft-symbol">NFT Symbol</label>
                <input type="text" id="nft-symbol" placeholder="Enter the NFT Symbol here" onChange={(e) => setNftSymbol(e.target.value)}  />
              </li>
              <li>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Enter the Name here" onChange={(e) => setName(e.target.value)} />
              </li>
              <li>
                <label htmlFor="description">Description</label>
                <input type="text" id="description" placeholder="Enter the Description here " onChange={(e) => setDescription(e.target.value)}  />
              </li>
              <li>
                <label htmlFor="image">Image</label>
                <input type="file" id="image" onChange={changeHandler} />
              </li>
              <li>
                <button type="submit">Submit</button>
              </li>
            </ul>
          </form>
        </div>
    )
}

function getBase64(file, cb) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
      cb(reader.result)
  };
  reader.onerror = function (error) {
      console.log('Error: ', error);
  };
}

export default Form;