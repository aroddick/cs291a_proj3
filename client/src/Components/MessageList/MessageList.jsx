import React, { useState } from "react";
import { useForm } from "react-hook-form";

import axios from 'axios';

export default function MessageList() {
    const { register, handleSubmit } = useForm();
    const [result, setResult] = useState("");
    const onSubmit = async (e) => {
        e.preventDefault();
        try{
            await axios.post("/message", register);
            history.push("/login");
        }catch(err){
            console.log(err);
        }
    };
    // (data) => setResult(JSON.stringify(data));
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Headers />
            <input {...register("firstName")} placeholder="First name" />
            <input {...register("lastName")} placeholder="Last name" />

            <p>{result}</p>
            <input type="submit" />
        </form>
    )
}


class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 'Write chat message!'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A message was submitted: ' + this.state.value);
        event.preventDefault();
    }
    
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Messages:
                        <textarea value={this.state.value} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export default MessageList;