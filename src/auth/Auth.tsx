import React, { useState } from 'react';
import firebase from 'firebase/app';

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
            <form onSubmit={onAuthTriggered}>
                <input
                    type="text"
                    name="_inputEmail"
                    value={email}
                    onChange={onEmailInputChanged}
                />
                <br/>
                <input
                    type="text"
                    name="_inputPassword"
                    value={password}
                    onChange={onPasswordInputChanged}
                />
                <input type="submit" value="Sign-in"/>
            </form>
        </div>
    );
}

export default AuthComponent