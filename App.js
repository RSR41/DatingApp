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
import OnlineStatusMonitor from './screens/OnlineStatusMonitor'; // OnlineStatusMonitor 부분
import SignupScreen from './screens/SignupScreen'; // 회원가입 화면
import LoginScreen from './screens/LoginScreen';   // 로그인 화면
import HomeScreen from './screens/HomeScreen';     // 홈 화면
import MatchingPreferenceScreen from './screens/MatchingPreferenceScreen';
import MatchingListScreen from './screens/MatchingListScreen';
import { ActivityIndicator } from 'react-native';  // 로딩 표시
import AdminHomeScreen from './screens/AdminHomeScreen';  // 📌  추가
import ChatScreen from './screens/ChatScreen';  // ChatScreen 구문 가져오기

const Stack = createNativeStackNavigator(); // Stack 네비게이터 생성

export default function App() {
  const [user, setUser] = useState(null);         // 로그인한 유저 저장
  const [loading, setLoading] = useState(true);   // 로딩 상태

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔥 currentUser", currentUser); // 디버깅용
  
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          console.log("📄 userDoc.exists:", userDoc.exists());
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const isAdmin = userData.isAdmin === true; // ✅ 관리자 여부 확인
  
            // 🔄 상태 업데이트: isAdmin까지 함께 저장
            setUser({ ...currentUser, profileSet: true, isAdmin });
          } else {
            // ⚠️ 문서는 없지만 유저는 존재 → profileSet false로
            setUser({ ...currentUser, profileSet: false });
          }
        } catch (error) {
          console.error("❌ Firestore getDoc error:", error);
          setUser({ ...currentUser, profileSet: false });
        }
      } else {
        setUser(null); // 로그아웃 상태
      }
  
      setLoading(false); // 로딩 끝
    });
  
    return () => unsubscribe(); // cleanup
  }, []);


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <>
      {/* 온라인 상태 모니터링을 위한 컴포넌트 */}
      <OnlineStatusMonitor />

    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.profileSet ? (
            user.isAdmin ? (
              // 🔐 관리자일 경우
              <>
                <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                <Stack.Screen name="MatchingList" component={MatchingListScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
              </>
            ) : (
              // 👤 일반 사용자일 경우
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="MatchingPreference" component={MatchingPreferenceScreen} />
                <Stack.Screen name="MatchingList" component={MatchingListScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
              </>
            )
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
    </>
      );
    }