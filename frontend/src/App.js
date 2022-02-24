import './App.css';
import Header from './Header'
import Body from './Body'
import Disclaimer from './Disclaimer';
import { useState } from 'react';

function App() {
  const [blockchainApi, setBlockChainApi] = useState();
  const [broker, setBroker] = useState();
  const [value, setValue] = useState();
  const [baseUri, setBaseUri] = useState();

   fetch(
    "https://api.thequicknft.com/config")
                .then((res) => res.json())
                .then((json) => {
                  setBlockChainApi(json.blockchain_provider)
                  setBroker(json.account)
                  setValue(json.value)
                  setBaseUri(json.base_token_uri)
                })


  return (
    <div className="Wrapper">
      <Header></Header>
      <Disclaimer blockchainApi={blockchainApi}></Disclaimer>
      <Body broker={broker} value={value} baseUri={baseUri}></Body>
    </div>
  );
}

export default App;
