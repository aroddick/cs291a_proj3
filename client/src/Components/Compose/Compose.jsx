import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from 'axios';

export default function MessageList(props) {
    console.log(props);
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
                if(response.status == 201){
                    console.log("correct token")
                    props.messageTokenHandler(response.data.Token);
                }
                if(response.status == 409){
                    console.log("incorrect token")
                    props.messageTokenHandler(response.data.Token);
                }
            })
            .catch((error) => {
                console.log('error: ' + error);
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
