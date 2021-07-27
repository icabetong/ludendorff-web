import React, { useState } from 'react';
import firebase from 'firebase/app';
import './Auth.scss';

const AuthComponent = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((user) => {

            }).catch((error) => {

            });
    }

    const onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }
    const onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    return (
        <div>
            <h2 className="header">Hello.<br/>Welcome Back.</h2>
            <form onSubmit={onAuthTriggered}>
                <label htmlFor="_inputEmail">Email: </label>
                <br/>
                <input
                    type="text"
                    name="_inputEmail"
                    value={email}
                    onChange={onEmailInputChanged}
                />
                <br/>
                <label htmlFor="_inputPassword">Password: </label>
                <br/>
                <input
                    type="text"
                    name="_inputPassword"
                    value={password}
                    onChange={onPasswordInputChanged}
                />
                <br/>
                <br/>
                <input type="submit" value="Sign-in"/>
            </form>
        </div>
    );
}

export default AuthComponent