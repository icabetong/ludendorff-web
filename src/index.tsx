import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

import { Ludendorff } from './feature/core/Core';
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
const firebaseApp = initializeApp(config);
const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
export { firebaseApp, auth, firestore };

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <PreferenceProvider>
      <Ludendorff/>
    </PreferenceProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
