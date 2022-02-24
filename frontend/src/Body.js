import './App.css';
import Form from './Form'

function Body(props){
    return (
        <div className="App-body">
            <Form contract={props.contract} account={props.account} broker={props.broker} value={props.value}></Form>
        </div>
    )
}

export default Body;