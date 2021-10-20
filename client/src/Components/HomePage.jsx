import React, {useState, useEffect} from 'react'
import MessageList from './MessageList/MessageList';
import Compose from "./Compose/Compose";
import UserList from './UserList/UserList';
import {Container, Row, Col} from "react-bootstrap";

export default function HomePage(props) {
    console.log(props.webURL + "/stream/" + props.streamToken);
    const server = new EventSource(props.webURL + "/stream/" + props.streamToken);
    console.log(server);
    server.onmessage = function logEvents(event){
        console.log(event);
    }
    
    server.addEventListener("message", (event) => {
        if (event.data === "Goodbye!") {
            console.log("Closing SSE connection");
            server.close();
        } else {
            console.log(event.data);
        }
    });
    server.onerror = (_event) => {
        console.log("Connection lost, reestablishing");
    };

    return (
        <div>
            <Container>
                <Row>
                    <Col sm={8}>
                        <Compose webURL = {props.webURL}
                        messageToken = {props.messageToken}
                        messageTokenHandler={props.messageTokenHandler}/>
                    </Col>
                    <Col sm={4}>
                        // add userlist
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
