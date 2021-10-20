import React, { useState } from "react";
import classes from './MessageList.module.css'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from 'axios';

export default function MessageList(props) {
    // const [message, setMessage] = useState("");
    // function handleMessageChange(event){
    //     setWebURL(event.target.value);
    //     props.webURLHandler(event.target.value);
    // };
    // async function handleSubmit(event) {
    //     event.preventDefault();
    //     console.log('You clicked submit');
    //     const info = new FormData();
    //     info.append('message', username);
    //     await axios.post(webURL + "/message", info, {headers:{
    //         'HTTP_AUTHORIZATION' : props.message_token
    //     }})
    //         .then((response) => {
    //             console.log(response);
    //             if(response.status == 201){
    //                 console.log("correct token")
    //                 props.messageTokenHandler(response.data.Token);
    //             }
    //             if(response.status == 409){
    //                 console.log("incorrect token")
    //                 props.messageTokenHandler(response.data.Token);
    //             }
    //         })
    //         .catch((error) => {
    //             console.log('error: ' + error);
    //         });
    // }
    // return (
    //     <div>
    //         <Form onSubmit={handleSubmit}>
    //             <Form.Group size="lg" controlId="text">
    //                 <Form.Label>Send a Message</Form.Label>
    //                 <Form.Control
    //                     type="text"
    //                     placeholder="Enter Message"
    //                     value={webURL}
    //                     onChange={(e) => setMessage(e.target.value)}
    //                 />
    //             </Form.Group>
    //             <Button 
    //                 block 
    //                 size="lg" 
    //                 type="submit">
    //                 Send
    //             </Button>
    //         </Form>
    //     </div>
    // )
};
