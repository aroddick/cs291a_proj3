import React, { useState} from "react";
import "./App.css";

import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage";
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";

const App = () => {
    const [webURL, setWebURL] = useState("");
    const [streamToken, setStreamToken] = useState("");
    const [messageToken, setMessageToken] = useState("");
    const [username, setUsername] = useState("");

    function webURLHandler(newUrl){
        setWebURL(newUrl);
    };
    function messageTokenHandler(newMessageToken){
        setMessageToken(newMessageToken);
    };
    function streamTokenHandler(newStreamToken){
        setStreamToken(newStreamToken);
    };
    function usernameHandler(newUsername){
        setUsername(newUsername);
    };

    return (
        <Router>
            <Switch>
                <Route exact path = "/">
                    {streamToken === "" ? <LoginForm webURLHandler={webURLHandler} 
                        messageTokenHandler={messageTokenHandler} 
                        streamTokenHandler={streamTokenHandler}
                        usernameHandler={usernameHandler}/> 
                        : <HomePage webURL = {webURL}
                        streamToken = {streamToken}
                        streamTokenHandler={streamTokenHandler}
                        messageToken = {messageToken}
                        messageTokenHandler={messageTokenHandler}
                        username = {username}/>}
                </Route>
                <Route exact path = "/login">
                    <LoginForm webURLHandler={webURLHandler} 
                        messageTokenHandler={messageTokenHandler} 
                        streamTokenHandler={streamTokenHandler}
                        usernameHandler={usernameHandler}/>
                </Route>
            </Switch>
        </Router>
    );
}
export default App;
