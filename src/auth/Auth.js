import React from 'react';
import { Link } from 'react-router-dom';

class Auth extends React.Component {
    
    render() {
        return (
            <div>
                <Link to="/main">
                    <button>Go</button>
                </Link>
            </div>
        )
    }
}

export { Auth }