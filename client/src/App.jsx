import React, { useState, Component } from "react";
import "./App.css";

// import MessageList from "./Components/MessageList/MessageList";
// import UserList from "./Components/UserList/UserList";
import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage";
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

    function webURLHandler(newUrl){
        setWebURL(newUrl);
    };
    function messageTokenHandler(newMessageToken){
        setMessageToken(newMessageToken);
    };
    function streamTokenHandler(newStreamToken){
        setStreamToken(newStreamToken);
    };

    return (
        <Router>
            <Switch>
                <Route exact path = "/">
                    {streamToken == "" ? <LoginForm webURLHandler={webURLHandler} 
                        messageTokenHandler={messageTokenHandler} 
                        streamTokenHandler={streamTokenHandler}/> 
                        : <HomePage webURL = {webURL}
                        streamToken = {streamToken}
                        streamTokenHandler={streamTokenHandler}
                        messageToken = {messageToken}
                        messageTokenHandler={messageTokenHandler}/>}
                </Route>
                <Route exact path = "/login">
                    <LoginForm webURLHandler={webURLHandler} 
                        messageTokenHandler={messageTokenHandler} 
                        streamTokenHandler={streamTokenHandler}/>
                    <div>
                        <ul>
                            <li>
                                stream token : {streamToken}
                            </li>
                            <li>
                                message token : {messageToken}
                            </li>
                            <li>
                                weburl : {webURL}
                            </li>
                        </ul>
                    </div>
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
