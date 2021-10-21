import React, { useState, useEffect } from 'react'
import MessageList from './MessageList/MessageList';
import Compose from "./Compose/Compose";
import UserList from './UserList/UserList';
import Login from './LoginForm/LoginForm';
// import { useAlert } from 'react-alert';
// import { useHistory } from "react-router";

export default function HomePage() {

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState("");

  const [webURL, setWebURL] = useState("");
  const [streamToken, setStreamToken] = useState(null);
  const [messageToken, setMessageToken] = useState(null);

//   const history = useHistory();
//   const alert = useAlert()

  function webURLHandler(newUrl) {
    setWebURL(newUrl);
  };
  function messageTokenHandler(newMessageToken) {
    setMessageToken(newMessageToken);
  };
  function streamTokenHandler(newStreamToken) {
    setStreamToken(newStreamToken);
  };

  useEffect(() => {
    if (streamToken == null)
      return
    const server = new EventSource(webURL + "/stream/" + streamToken);
    server.addEventListener("ServerStatus", (event) => {
      const obj = JSON.parse(event.data);
      const format = date_format(obj['created']);
      const message = (format + " Status: " + obj['status']);
      setMessages(messages => [...messages, message]);
    //   alert.info("New Message!");
    });
    server.addEventListener("Users", (event) => {
      const obj = JSON.parse(event.data);
      setUsers(obj['users'].slice(0, -1));
    });
    server.addEventListener("Message", (event) => {
      const obj = JSON.parse(event.data);
      const format = date_format(obj['created']);
      const message = (format + " (" + obj['user'] + ") " + obj['message']);
      setMessages(messages => [...messages, message]);
    //   alert.info("New Message!");
    });
    server.addEventListener("Join", (event) => {
      const obj = JSON.parse(event.data);
      const format = date_format(obj['created']);
      const message = (format + " JOIN: " + obj['user']);
      setMessages(messages => [...messages, message]);
    //   alert.info("New Message!");
      setUsers(users => [...users, obj['user']]);
    });
    server.addEventListener("Part", (event) => {
      const obj = JSON.parse(event.data);
      const format = date_format(obj['created']);
      const message = (format + " PART: " + obj['user']);
      setMessages(messages => [...messages, message]);
    //   alert.info("New Message!");
      setUserToDelete(obj['user']);
    });
    server.addEventListener("Disconnect", (event) => {
      console.log("Closing SSE connection");
      server.close();
      // history.push('/login');
      setStreamToken(null);
      setMessageToken(null);
    });
    server.onerror = (_event) => {
      console.log("Connection lost, reestablishing");
    };
  }, streamToken);

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
    setUserToDelete("")
    setUsers(userList);
  };

  function date_format(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
  };

  return (
    <div>
      {streamToken === null && <Login webURLHandler={webURLHandler}
        messageTokenHandler={messageTokenHandler}
        streamTokenHandler={streamTokenHandler}/>}
      <MessageList messages={messages} />
      <Compose webURL={webURL}
        messageToken={messageToken}
        messageTokenHandler={messageTokenHandler} />
      <UserList usernames={users} 
                handleRemoveItem = {handleRemoveItem}
                userToDelete = {userToDelete}/>
        {/* <Compose webURL = {props.webURL}
                messageToken = {props.messageToken}
                messageTokenHandler={props.messageTokenHandler}/>
        <MessageList messages = {messages} />
        <UserList users = {users} 
                handleRemoveItem = {handleRemoveItem}
                userToDelete = {userToDelete}/> */}
    </div>
  );
}
