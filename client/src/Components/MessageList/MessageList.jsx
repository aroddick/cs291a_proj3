import React from "react";

export default function MessageList(props) {
    return(
        <div>
            <ul>
                {props.messages.map((message) => (
                    <li>{message}</li>
                ))}
            </ul>
        </div>
    )
};
