import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import './index.scss';
import { MainComponent } from './main/Main';
import { AuthProvider } from './auth/AuthProvider';

const config = {
    apiKey: process.env.REACT_APP_BACKEND_API_KEY,
    authDomain: process.env.REACT_APP_BACKEND_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
}
firebase.initializeApp(config);
export const auth = firebase.auth()
export const firestore = firebase.firestore()

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <MainComponent/>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
