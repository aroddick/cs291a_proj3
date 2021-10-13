import { Component } from "react";
import "./App.css";

import MessageList from "./Components/MessageList/MessageList";

class App extends Component {
  constructor(props) {
    super(props);

    const server = new EventSource("http://localhost:3001/stream/a");
    server.addEventListener("message", (event) => {
      if (event.data === "Goodbye!") {
        console.log("Closing SSE connection");
        server.close();
      } else {
        console.log(event.data);
      }
    });
    server.onerror = (_event) => {
      console.log("Connection lost, reestablishing");
    };
  }

  render() {
    return (
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

        </div>
      </div>
    );
  }
}
export default App;
