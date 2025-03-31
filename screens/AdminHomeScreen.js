// AdminHomeScreen.js (부분 코드)
// 필요한 import 구문 추가
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const AdminHomeScreen = () => {
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
    </View>
  );
};

export default AdminHomeScreen;
