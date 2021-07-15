import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Core } from './core/Core';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase/app';

const config = {
    apiKey: "AIzaSyA77qCOBnBaYbMR_LgETYkXCmN8AqRgzQU",
    authDomain: "keeper-io.firebaseapp.com",
    projectId: "keeper-io",
    storageBucket: "keeper-io.appspot.com",
    messagingSenderId: "783396412369",
    appId: "1:783396412369:web:8a563577005b3cab251ef0",
    measurementId: "G-KTPGYYQSJ5"
}
firebase.initializeApp(config);

ReactDOM.render(
  <React.StrictMode>
    <Core />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
