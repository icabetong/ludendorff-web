import { useContext } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import AuthComponent from '../auth/Auth';
import { AuthContext } from '../auth/AuthProvider';
import CoreComponent from '../core/Core';

export const MainComponent = () => {
    const user = useContext(AuthContext)

    return (
        <div>
            <BrowserRouter>
                <Route exact path="/">
                    {user ? <CoreComponent/> : <AuthComponent/> }
                </Route>
            </BrowserRouter>
        </div>
    )
}