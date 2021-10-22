import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from 'axios';
import { useAlert } from 'react-alert';
import classes from './Compose.module.css';

export default function Compose(props) {
  const [message, setMessage] = useState("");
  const alert = useAlert()
  async function handleSubmit(event) {
    event.preventDefault();
    console.log('You clicked submit');
    const info = new FormData();
    info.append('message', message);
    setMessage("")
    console.log(props.webURL + "/message");
    const RequestMessage = "Bearer " + props.messageToken;
    console.log(RequestMessage);
    await axios.post(props.webURL + "/message", info, {
      headers: {
        'Authorization': RequestMessage,
      }
    })
      .then((response) => {
        console.log(response);
        if (response.status === 201) {
          console.log("correct token")
          console.log(response.headers)
          // console.log(response.data)
          props.messageTokenHandler(response.headers.token);
        }
        if (response.status === 409) {
          console.log("incorrect token")
          props.messageTokenHandler(response.headers.token);
        }
      })
      .catch((error) => {
        if (error.response != null && error.response.status === 409) {
          console.log("incorrect token")
          props.messageTokenHandler(error.response.headers.token);
          alert.error("User stream not open. Refreshing tokens...")
        } else {
          alert.error("Error sending message")
        }
        
      });
  }
  return (
    <div className={classes.container}>
      <form onSubmit={handleSubmit} className={classes.messageBox}>
        <input
          style={{ width: '100%' }}
          type="text"
          placeholder={props.disconnected ? "Please connect to send messages" : "Enter Message"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={props.disconnected}
        />
      </form>
      {/* <Form onSubmit={handleSubmit} style={{width: '100%'}}>
        <Form.Group size="lg" controlId="text">
          <Form.Control
            type="text"
            placeholder={props.disconnected ? "Please connect to send messages" : "Enter Message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={props.disconnected}
          />
        </Form.Group>
        {/* <Button
          block
          size="lg"
          type="submit">
          Send
        </Button>
      </Form> */}
    </div>
  )
};
