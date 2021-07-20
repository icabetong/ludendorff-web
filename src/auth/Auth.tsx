import React from 'react';

type AuthState = {
    email: string,
    password: string
}

class AuthComponent extends React.Component<{}, AuthState> {
    constructor(props: any) {
        super(props)

        this.state = {
            email: " ",
            password: " "
        }
    }

    onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ email: event.target.value })
    }
    onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ password: event.target.value })
    }

    render() {
        return (
            <div>
                <form>
                    <input
                        type="text"
                        name="_inputEmail"
                        value={this.state.email}
                        onChange={this.onEmailInputChanged}
                    />
                    <br/>
                    <input
                        type="text"
                        name="_inputPassword"
                        value={this.state.password}
                        onChange={this.onPasswordInputChanged}
                    />
                </form>
            </div>
        );
    }
}

export default AuthComponent