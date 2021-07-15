import React from 'react';
import { HashRouter, Route } from 'react-router-dom'; 
import { Auth } from '../auth/Auth';
import { Main } from '../main/Main';

class Core extends React.Component {
    render() {
        return (
            <div className="app">
                <HashRouter>
                    <Route exact path="/" component={Auth}/>
                    <Route exact path="/main" component={Main}/>
                </HashRouter>
            </div>
        )
    }
}

export { Core }