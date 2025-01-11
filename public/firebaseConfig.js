import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
    apiKey: "AIzaSyCdphOqz4IhAkHAnC8W4wKEOInNzCJopAc",
    authDomain: "comercial-e8496.firebaseapp.com",
    projectId: "comercial-e8496",
    storageBucket: "comercial-e8496.firebasestorage.app",
    messagingSenderId: "232882740652",
    appId: "1:232882740652:web:11d677e9af81c051eb2e09"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };