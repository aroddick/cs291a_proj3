import React, {useState, useEffect} from 'react'
import MessageList from './MessageList/MessageList';
import Compose from "./Compose/Compose";
import UserList from './UserList/UserList';
import {Container, Row, Col} from "react-bootstrap";
import { useHistory } from "react-router";

export default function HomePage(props) {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [userToDelete, setUserToDelete] = useState("");

    const history = useHistory();

    useEffect(()=>{
        const server = new EventSource(props.webURL + "/stream/" + props.streamToken);
        server.addEventListener("ServerStatus", (event) => {
            const obj = JSON.parse(event.data);
            // console.log(obj['status']);
            const format = date_format(obj['created']);
            // console.log(format);
            const message = (format + " Status: " + obj['status']);
            setMessages(messages => [...messages, message]);
        });
        server.addEventListener("Users", (event) => {
            const obj = JSON.parse(event.data);
            const userlist = obj['users'].slice(0, -1);
            setUsers(userlist);
        });
        server.addEventListener("Message", (event) => {
            // console.log(event.data);
            const obj = JSON.parse(event.data);
            const format = date_format(obj['created']);
            const message = (format + " (" + obj['user'] + ") " + obj['message']);
            setMessages(messages => [...messages, message]);
        });
        server.addEventListener("Join", (event) => {
            // console.log(event.data);
            const obj = JSON.parse(event.data);
            const format = date_format(obj['created']);
            const message = (format + " JOIN: " + obj['user']);
            setMessages(messages => [...messages, message]);
            setUsers(users => [...users, obj['user']]);
        });
        server.addEventListener("Part", (event) => {
            // console.log(event.data);
            const obj = JSON.parse(event.data);
            const format = date_format(obj['created']);
            const message = (format + " PART: " + obj['user']);
            setMessages(messages => [...messages, message]);
            setUserToDelete(obj['user']);
        });
        server.addEventListener("Disconnect", (event) => {
            console.log("Closing SSE connection");
            server.close();
            history.push('/login');
        });
        server.onerror = (_event) => {
            console.log("Connection lost, reestablishing");
        };
    }, []); 
    
    useEffect(() => {
        window.addEventListener("beforeunload", alertUser);
        return () => {
          window.removeEventListener("beforeunload", alertUser);
        };
      }, []);
      const alertUser = (e) => {
        console.log("alert")
        e.preventDefault();
        e.returnValue = "";
      };
    
    function handleRemoveItem (userList){
        // assigning the list to temp variable
        setUserToDelete("")
        setUsers(userList);
    };
    // const RemovePeople = (e) =>{
    //     const temp = [...users];
    //     let index = users.findIndex(x => x === user);
    //     temp.splice(index, 1);

    //     let name = e.data['user'];
    //     setUsers(users.filter((user)=>(user !== name)))
    // };

    function date_format(timestamp) {
        var date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
    }

    return (
        <div>
            <Container>
                <Row>
                    <Col md={8}>
                        <Compose webURL = {props.webURL}
                                messageToken = {props.messageToken}
                                messageTokenHandler={props.messageTokenHandler}/>
                        <MessageList messages = {messages} />
                    </Col>
                    <Col md={4}>
                        <UserList users = {users} 
                                handleRemoveItem = {handleRemoveItem}
                                userToDelete = {userToDelete}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
