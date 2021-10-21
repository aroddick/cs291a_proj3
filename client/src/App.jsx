import React, { useState } from "react";
import "./App.css";

import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  );
}
export default App;
