import './App.css';
import Header from './Header'
import Body from './Body'
import Disclaimer from './Disclaimer';
import Web3 from 'web3'
import { useEffect, useState } from 'react';

function App() {
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [blockchainApi, setBlockChainApi] = useState();
  const [broker, setBroker] = useState();
  const [value, setValue] = useState();

  useEffect(() => {
    async function load() {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      let abi = require('./abi.json')
      let contract = new web3.eth.Contract(abi)
      setContract(contract)
    }
    
    load();
   }, []);

   fetch(
    "https://api.thequicknft.com/config")
                .then((res) => res.json())
                .then((json) => {
                  setBlockChainApi(json.blockchain_provider)
                  setBroker(json.account)
                  setValue(json.value)
                })


  return (
    <div className="Wrapper">
      <Header></Header>
      <Disclaimer account={account} blockchainApi={blockchainApi}></Disclaimer>
      <Body contract={contract} account={account} broker={broker} value={value}></Body>
    </div>
  );
}

export default App;
