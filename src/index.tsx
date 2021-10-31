import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { AuthProvider } from './feature/auth/AuthProvider';
import { CoreComponent } from './feature/core/Core';
import { PreferenceProvider } from './feature/settings/Preference';
import * as serviceWorker from "./serviceWorkerRegistration";

import './index.css';
import './localization';

const config = {
    apiKey: process.env.REACT_APP_BACKEND_API_KEY,
    authDomain: process.env.REACT_APP_BACKEND_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
}
firebase.initializeApp(config)
export const auth = firebase.auth()
export const firestore = firebase.firestore()
firestore.settings({ ignoreUndefinedProperties: true, merge: true })

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <PreferenceProvider>
        <CoreComponent/>
      </PreferenceProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
