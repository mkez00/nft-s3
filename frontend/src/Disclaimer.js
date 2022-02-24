import './Disclaimer.css'

function Disclaimer(props){
    return (
        <div className="wrapper">
            <p>The Quick NFT is a sample project that was created to allow a user to create an ERC-721 token on the <b>Polygon Mainnet: {props.blockchainApi}</b>.  The metadata associated with the token will be stored in a centralized repository.  To prevent misuse of this sample project, an added <b>MATIC</b> fee is required in the smart contract in order to process the metadata and upload it to the central repository.  This data will/can be deleted at any time.  I suggest you do not use this utility for creating ERC-721 tokens and use the many blockchain enabled applications that do this already.</p>
            <p>You are connected to: <b>{props.account}</b></p>
        </div>
    )
}

export default Disclaimer;