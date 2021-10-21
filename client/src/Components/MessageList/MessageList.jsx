import React, { useEffect } from "react";
import classes from './MessageList.module.css'

export default function MessageList({ messages }) {

  useEffect(() => {
    console.log("Message List updated!")
    var element = document.getElementById("messageList");
    element.scrollTop = element.scrollHeight - element.clientHeight;
  });

  return (
    <div id="messageList" className={classes.container}>
      {messages && <ul>
        {messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
      }
    </div>


  )
};
