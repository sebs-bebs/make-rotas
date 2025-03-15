// Initialize Firebase for hosting only
import { initializeApp } from 'firebase/app';
import firebaseConfig from './config';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

export default app;
