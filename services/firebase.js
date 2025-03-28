// Firebase SDK에서 필요한 함수 불러오기
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ 추가

// Firebase 프로젝트 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyC3i6Xi9arhiV05aYAE9u8ZxZcnwfNoqlo",
  authDomain: "datingapp-b5bd0.firebaseapp.com",
  projectId: "datingapp-b5bd0",
  storageBucket: "datingapp-b5bd0.appspot.com",
  messagingSenderId: "901982259380",
  appId: "1:901982259380:web:bef1ec5863ff2319f8afe1",
  measurementId: "G-5Q29HK1SGX"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 인증 & Firestore 초기화
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Firestore 인스턴스 초기화

// 인증 및 DB 객체 외부로 내보내기
export { auth, db };