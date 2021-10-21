import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from 'axios';
import { useAlert } from 'react-alert';

export default function MessageList(props) {
    console.log(props);
    const alert = useAlert();
    const [message, setMessage] = useState("");
    async function handleSubmit(event) {
        event.preventDefault();
        console.log('You clicked submit');
        const info = new FormData();
        info.append('message', message);
        console.log(props.webURL + "/message");
        const RequestMessage = "Bearer " + props.messageToken;
        console.log(RequestMessage);
        await axios.post(props.webURL + "/message", info, {headers:{
            'Authorization' : RequestMessage,
        }})
            .then((response) => {
                console.log(response);
                if(response.status === 201){
                    // console.log("correct token");
                    // console.log(response.headers);
                    alert.success("message  successful");
                    // console.log(response.data)
                    props.messageTokenHandler(response.headers.token);
                }
            })
            .catch((error) => {
                if(error.response.status === 403){
                    console.log("header not provided")
                    alert.error("header not provided");
                }
                else if(error.response.status === 409){
                    console.log("incorrect token")
                    props.messageTokenHandler(error.response.headers.token);
                    alert.error("incorrect token");
                }
                else if(error.response.status === 422){
                    console.log("message blank / params no match")
                    alert.error("message blank / params no match");
                }
            });
    }
    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group size="lg" controlId="text">
                    <Form.Label>Send a Message</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </Form.Group>
                <Button 
                    block 
                    size="lg" 
                    type="submit">
                    Send
                </Button>
            </Form>
        </div>
    )
};
