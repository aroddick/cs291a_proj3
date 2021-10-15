import React, { useState } from "react";
import { useForm } from "react-hook-form";
import classes from './MessageList.module.css'

import axios from 'axios';

const MessageList = () => {
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

export default MessageList;