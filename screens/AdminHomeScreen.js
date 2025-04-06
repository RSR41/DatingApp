// AdminHomeScreen.js (부분 코드)
// 필요한 import 구문 추가
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native'; // navigation 이동을 위해


const AdminHomeScreen = () => {
  const navigation = useNavigation(); // 네비게이션 인스턴스 가져오기

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Firebase에서 로그아웃 실행
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // 로그인 화면으로 초기화 이동
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 전체 사용자 목록을 Firestore에서 불러오는 함수
    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // 사용자 목록 개별 항목 렌더링 (추후 신고/차단 버튼 추가 가능)
  const renderItem = ({ item }) => (
    <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Text style={{ fontSize: 16 }}>
        {item.name || item.email} (ID: {item.id})
      </Text>
      {/* 신고/차단 기능 버튼은 여기에 추가 가능 */}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        관리자 페이지: 사용자 목록
      </Text>
  
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
  
      {/* ✅ 로그아웃 버튼 추가 (관리자 → 로그인 화면으로 이동) */}
      <View style={{ marginTop: 24 }}>
        <Button title="로그아웃" onPress={handleLogout} color="red" />
      </View>
    </View>
  );  
};

export default AdminHomeScreen;
