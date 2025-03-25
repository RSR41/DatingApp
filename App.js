// App.js
import React, { useEffect, useState } from 'react'; // 상태 및 생명주기 훅
import { onAuthStateChanged } from 'firebase/auth'; // Firebase 로그인 상태 감지
import { auth } from './services/firebase'; // Firebase 인증 인스턴스
// 🧠 프로필 등록 여부 확인용 Firestore 함수
import { doc, getDoc } from 'firebase/firestore';
import { db } from './services/firebase';

// 📄 프로필 설정 화면
import ProfileSetupScreen from './screens/ProfileSetupScreen';

import { NavigationContainer } from '@react-navigation/native'; // 네비게이션 컨테이너
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack Navigator
import SignupScreen from './screens/SignupScreen'; // 회원가입 화면
import LoginScreen from './screens/LoginScreen';   // 로그인 화면
import HomeScreen from './screens/HomeScreen';     // 홈 화면
import { ActivityIndicator } from 'react-native';  // 로딩 표시

const Stack = createNativeStackNavigator(); // Stack 네비게이터 생성

export default function App() {
  const [user, setUser] = useState(null);         // 로그인한 유저 저장
  const [loading, setLoading] = useState(true);   // 로딩 상태

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 🔍 Firestore에서 사용자 프로필 존재 여부 확인
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, profileSet: true }); // 프로필 있음
        } else {
          setUser({ ...currentUser, profileSet: false }); // 프로필 없음
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.profileSet ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}