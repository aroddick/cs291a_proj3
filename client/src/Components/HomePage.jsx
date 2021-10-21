import React, {useState, useEffect} from 'react'
import MessageList from './MessageList/MessageList';
import Compose from "./Compose/Compose";
import UserList from './UserList/UserList';
import {Container, Row, Col} from "react-bootstrap";
import { useHistory } from "react-router";

export default function HomePage(props) {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    const [firstLogIn, setFirstLogIn] = useState(false);

    const history = useHistory();

    // want to pass users down into userlist

    // console.log(props.webURL + "/stream/" + props.streamToken);
    // console.log(messages);
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
            console.log(event.data);

            const obj = JSON.parse(event.data);
            // console.log(obj['users']);
            const format = date_format(obj['created']);
            // console.log(format);
            setUsers(obj['users']);
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
            if(firstLogIn === false){
                setFirstLogIn(true);
            }
            else{
                addUserHandler(obj['user']);
            }
        });
        server.addEventListener("Part", (event) => {
            // console.log(event.data);
            const obj = JSON.parse(event.data);
            const format = date_format(obj['created']);
            const message = (format + " PART: " + obj['user']);
            setMessages(messages => [...messages, message]);
            removeUserHandler(obj['user']);
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

    // function updateUserHandler(newUserList){
        
    // };
    function addUserHandler(user){
        setUsers(users => [...users, user]);
    };
    function removeUserHandler(user){
        for(let i = 0; i < users.length; i++){
            if(user === users[i]){
                users.splice(i, 1);
            }
        }
    };
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
                        {/* <ul>
                            {users.map((user) => (
                                <li>{user}</li>
                            ))}
                        </ul> */}
                        <UserList users = {users}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
