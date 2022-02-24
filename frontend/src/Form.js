import './Form.css'
import { useState } from 'react';

function Form(props){

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [isSelected, setIsSelected] = useState(false);

  const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
    setIsSelected(true)
    console.log(event.target.files[0].length)
	};
  

  let handleSubmit = async (e) => {
    e.preventDefault();

    let imageBase64 = ''  
    getBase64(selectedFile, async (result) => {
      imageBase64 = result;
  
      let res = await fetch("https://api.thequicknft.com/process", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          description: description,
          contractId: "0x506e3f9F564111251C3528dBED31c60Aa8C408B9",
          image: imageBase64
        }),
      });
      let resJson = await res.json();
      if (res.status === 200) {
        console.log("User created successfully");
      } else {
        console.log("Some error occured");
      }

    });
    
    // submitProcess(imageBase64, async (result) => {
      // console.log("Calling process")
      // let res = await fetch("https://api.thequicknft.com/process", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     name: name,
      //     description: description,
      //     contractId: "0x506e3f9F564111251C3528dBED31c60Aa8C408B9",
      //     image: imageBase64
      //   }),
      // });
      // let resJson = await res.json();
      // if (res.status === 200) {
      //   console.log("User created successfully");
      // } else {
      //   console.log("Some error occured");
      // }
    // })
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <ul className="flex-outer">
          <li>
            <label htmlFor="nft-name">NFT Name</label>
            <input type="text" id="nft-name" placeholder="Enter the NFT Name here" />
          </li>
              <li>
                <label htmlFor="nft-symbol">NFT Symbol</label>
                <input type="text" id="nft-symbol" placeholder="Enter the NFT Symbol here" />
              </li>
              <li>
                <label htmlFor="token-uri">Token URI</label>
                <input type="text" id="token-uri" placeholder="Enter the Token URI here" />
              </li>
              <li>
                <label htmlFor="broker-address">Broker Address</label>
                <input type="text" id="broker-address" placeholder="Enter the Broker Address here" />
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