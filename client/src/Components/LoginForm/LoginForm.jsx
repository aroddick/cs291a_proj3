import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LoginForm.css";
import axios from 'axios';
import { useHistory } from "react-router";
import { useAlert } from 'react-alert';

export default function Login(props) {
    const [webURL, setWebURL] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const history = useHistory();
    const alert = useAlert();

    function handleWebURLChange(event){
        console.log(event);
        setWebURL(event.target.value);
        props.webURLHandler(event.target.value);
    };
    async function handleSubmit(event) {
        event.preventDefault();
        console.log('You clicked submit');
        const info = new FormData();
        info.append('username', username);
        info.append('password', password);
        await axios.post(webURL + "/login", info)
            .then((response) => {
                console.log(response);
                console.log(response.status);
                if(response.status === 201){
                    console.log("login successful");
                    alert.success("login successful");
                    props.messageTokenHandler(response.data.message_token);
                    props.streamTokenHandler(response.data.stream_token);
                }
            })
            .catch((error) => {
                if(error.response.status === 422){
                    console.log("params arent valid");
                    alert.error("params arent valid");
                }
                else if(error.response.status === 403){
                    console.log("inputted username/password is incorrect");
                    alert.error("inputted username/password is incorrect");
                }
                else if(error.response.status === 409){
                    console.log("stream already opened");
                    alert.error("stream already opened");
                }
                else if(error.response.status === 422){
                    console.log("provided fields dont match");
                    alert.error("provided fields dont match");
                }
            });
        history.push('/');
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
                        onChange={(e) => handleWebURLChange(e)}
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
                    type="submit" >
                    Login
                </Button>
            </Form>
        </div>
    );
}