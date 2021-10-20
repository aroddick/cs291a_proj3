import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LoginForm.css";
import axios from 'axios';

// if(!response.ok){
                //     throw new Error(response.status);
                // }
                // else{
                //     if(response.status == 201){ 
                //         console.log(response.data)
                //     }
                // }

export default function Login(props) {
    const [webURL, setWebURL] = useState("");
    const [streamToken, setStreamToken] = useState("");
    const [messageToken, setMessageToken] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        console.log('You clicked submit');
        const info = new FormData();
        info.append('username', username);
        info.append('password', password);
        await axios.post(webURL + "/login", info)
            .then((response) => {
                console.log(response);
                if(response.status == 201){
                    // console.log("success");
                    // console.log(response.data);
                    // console.log(response.data.message_token);
                    setMessageToken(response.data.message_token);
                    setStreamToken(response.data.stream_token);
                    // console.log(streamToken);
                    // console.log(messageToken);
                }
            })
            .catch((error) => {
                console.log('error: ' + error);
            });
    }
    return (
        <div className="Login">
            <Form onSubmit={handleSubmit}>
                <Form.Group size="lg" controlId="text">
                    <Form.Label>BackEnd URL</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter URL"
                        value={webURL}
                        onChange={(e) => setWebURL(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="text">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        autoFocus
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button 
                    block 
                    size="lg" 
                    type="submit" 
                    disabled={!validateForm()}>
                    Login
                </Button>
            </Form>
            <ul>
                <li>
                    username : {username}
                </li>
                <li>
                    stream token : {streamToken}
                </li>
                <li>
                    message token : {messageToken}
                </li>
                <li>
                    password : {password}
                </li>
                <li>
                    weburl : {webURL}
                </li>
            </ul>
        </div>
    );
}