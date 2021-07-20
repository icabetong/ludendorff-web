import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app';
import "firebase/auth";
import './index.css';
import Main from './main/Main';

const config = {
    apiKey: process.env.BACKEND_API_KEY,
    authDomain: process.env.BACKEND_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGE_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
}
firebase.initializeApp(config);
export const auth = firebase.auth();

ReactDOM.render(
  <React.StrictMode>
    <Main/>
  </React.StrictMode>,
  document.getElementById('root')
);
