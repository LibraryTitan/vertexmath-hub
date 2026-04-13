import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDGRaUjiuD-Gr_qlTxi3mx7rVTXSDlA3tc',
  authDomain: 'vertexmath-paper-builder.firebaseapp.com',
  projectId: 'vertexmath-paper-builder',
  storageBucket: 'vertexmath-paper-builder.firebasestorage.app',
  messagingSenderId: '997962500916',
  appId: '1:997962500916:web:bd7f08302e501bbacb3361',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)
