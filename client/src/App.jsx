import React, { useState, Component } from "react";
import "./App.css";

import MessageList from "./Components/MessageList/MessageList";
import UserList from "./Components/UserList/UserList";
import LoginForm from "./Components/LoginForm/LoginForm";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
  } from "react-router-dom";

const App = () => {
    const [webURL, setWebURL] = useState("");
    const [streamToken, setStreamToken] = useState("");
    const [messageToken, setMessageToken] = useState("");

    // const server = new EventSource("http://localhost:3001/stream/a");
    // server.addEventListener("message", (event) => {
    //     if (event.data === "Goodbye!") {
    //         console.log("Closing SSE connection");
    //         server.close();
    //     } else {
    //         console.log(event.data);
    //     }
    // });
    // server.onerror = (_event) => {
    //     console.log("Connection lost, reestablishing");
    // };

    function webURLHandler(newUrl){
        setWebURL(newUrl);
    };
    function messageTokenHandler(newMessageToken){
        setMessageToken(newMessageToken);
    };
    function streamTokenHandler(newStreamToken){
        setStreamToken(newStreamToken);
    };

    const userName = "";
    return (
        <Router>
            <Switch>
                <Route exact path = "/">

                </Route>
                <Route exact path = "/login">
                    <LoginForm webURLHandler={webURLHandler} 
                        messageTokenHandler={messageTokenHandler} 
                        streamTokenHandler={streamTokenHandler}/>
                </Route>
                {/* <Route>
                    <div className="chatServer">
                        <div className="messages">
                            <div className="messagesWrapper">
                                <div className="chatBoxTop">

                                </div>
                                <div className="chatBoxBottom">
                                    <MessageList />
                                </div>
                            </div>
                        </div>
                        <div className="onlineUsers">
                            <UserList />
                        </div>
                    </div>
                </Route> */}
            </Switch>
        </Router>
    );
}
export default App;
