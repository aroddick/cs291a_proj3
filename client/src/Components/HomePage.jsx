import React, {useState, useEffect} from 'react'
import MessageList from './MessageList/MessageList';
import Compose from "./Compose/Compose";
import UserList from './UserList/UserList';
import {Container, Row, Col} from "react-bootstrap";

export default function HomePage(props) {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

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
            // console.log(event.data);
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
            const message = (format + "JOIN: " + obj['user']);
            setMessages(messages => [...messages, message]);
        });
        server.addEventListener("Part", (event) => {
            // console.log(event.data);
            const obj = JSON.parse(event.data);
            const format = date_format(obj['created']);
            const message = (format + "PART: " + obj['user']);
            setMessages(messages => [...messages, message]);
        });
        server.onerror = (_event) => {
            console.log("Connection lost, reestablishing");
        };
    }, []); 

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
                        <ul>
                            {messages.map((message) => (
                                <li>{message}</li>
                            ))}
                        </ul>
                    </Col>
                    <Col md={4}>
                        <ul>
                            {users.map((user) => (
                                <li>{user}</li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
