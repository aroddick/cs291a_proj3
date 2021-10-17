import React, { useState } from "react";

const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    onSubmitSignIn = () => {
        fetch('HTTP://localhost:3001/login', {
            method: 'post',
            // mode: 'cors',
            // credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        })
            .then(response => response.json())
            .then(user => {
                // if(user.id){
                //     this.props.loadUser(user);
                //     this.props.onRouteChange('home');
                // }
                console.log('Success:', user);
            })
            .catch((err) => {
                console.error('Error:', err);
            });
    }

    return(
        <form onSubmit={onSubmitSignIn}>
            <input onChange={(value) => setUsername(value)}></input>
            <input onChange={(value) => setPassword(value)}></input>
            <input type='submit' />
        </form>
    )
}

export default LoginForm;