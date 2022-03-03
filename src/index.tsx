import React from 'react';
import ReactDOM from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

import { AuthProvider } from './feature/auth/AuthProvider';
import { CoreComponent } from './feature/core/Core';
import { PreferenceProvider } from './feature/settings/Preference';
import * as serviceWorker from "./serviceWorkerRegistration";

import './index.css';
import './localization';

const configDev = {
  apiKey: process.env.REACT_APP_BACKEND_API_KEY_DEV,
  authDomain: process.env.REACT_APP_BACKEND_DOMAIN_DEV,
  projectId: process.env.REACT_APP_PROJECT_ID_DEV,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET_DEV,
  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID_DEV,
  appId: process.env.REACT_APP_APP_ID_DEV,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID_DEV
}

const config = {
  apiKey: process.env.REACT_APP_BACKEND_API_KEY,
  authDomain: process.env.REACT_APP_BACKEND_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
}
const firebaseApp = initializeApp(config);
//const firebaseApp = initializeApp(!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? configDev : config);
const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
export { firebaseApp, auth, firestore };

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <PreferenceProvider>
        <CoreComponent />
      </PreferenceProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
