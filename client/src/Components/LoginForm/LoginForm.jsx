import React, { Component } from 'react'

export default class LoginForm extends Component {

    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: ''  
        }
    }

    onAccountChange = (event) => {
        this.setState({username : event.target.value})
    }
    onPasswordChange = (event) => {
        this.setState({password : event.target.value})
    }

    onSubmitSignIn = () => {
        fetch('HTTP://localhost:3001/login', {
            method: 'post',
            // mode: 'cors',
            // credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
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

    render() {
        return (
            <div>
                
            </div>
        )
    }
}
