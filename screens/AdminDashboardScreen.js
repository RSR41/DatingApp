// AdminDashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const AdminDashboardScreen = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]); // 신고 내역 배열 상태 추가
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // 전체 사용자 목록 실시간 구독 (개인정보, 온라인 상태, 정지 상태 등)
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), snapshot => {
      const userList = [];
      snapshot.forEach(docSnap => {
        userList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsers(userList);
    });
    return () => unsubscribeUsers();
  }, []);

  // 신고 내역 실시간 구독
  useEffect(() => {
    const unsubscribeReports = onSnapshot(collection(db, 'reports'), snapshot => {
      const reportList = [];
      snapshot.forEach(docSnap => {
        reportList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReports(reportList);
    });
    return () => unsubscribeReports();
  }, []);

  // 실시간 채팅방 목록 구독 (채팅방 메타데이터)
  useEffect(() => {
    const unsubscribeChats = onSnapshot(collection(db, 'chats'), snapshot => {
      const chatList = [];
      snapshot.forEach(docSnap => {
        chatList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setChats(chatList);
    });
    return () => unsubscribeChats();
  }, []);

  // 선택한 채팅방의 대화 내역 실시간 구독
  useEffect(() => {
    if (selectedChat) {
      const unsubscribeMessages = onSnapshot(
        collection(db, 'chats', selectedChat.id, 'messages'),
        snapshot => {
          const msgs = [];
          snapshot.forEach(docSnap => {
            msgs.push({ id: docSnap.id, ...docSnap.data() });
          });
          setMessages(msgs);
        }
      );
      return () => unsubscribeMessages();
    }
  }, [selectedChat]);

  // [신고/정지 기능 자동화] 신고 내역 기록 및 사용자 정지 처리 함수
  const reportUserAndSuspend = async (userId, reportReason = '불건전한 대화') => {
    Alert.alert(
      '사용자 신고',
      `사유: ${reportReason}\n해당 사용자를 정지하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '정지',
          onPress: async () => {
            try {
              // 1. 신고 내역 기록: reports 컬렉션에 신고 내역 추가
              await addDoc(collection(db, 'reports'), {
                reporterId: auth.currentUser ? auth.currentUser.uid : 'admin',
                reportedUserId: userId,
                reportReason,
                reportedAt: serverTimestamp(),
                status: 'pending', // 초기 상태 (추후 업데이트 가능)
              });
              // 2. 사용자 정지 처리: 해당 사용자의 isSuspended 필드를 true로 업데이트
              await updateDoc(doc(db, 'users', userId), {
                isSuspended: true,
              });
              Alert.alert('처리 완료', '사용자가 정지되었고 신고 내역이 기록되었습니다.');
            } catch (error) {
              console.error('신고/정지 처리 중 오류 발생:', error);
              Alert.alert('오류', '사용자 정지 처리 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // 사용자 목록 렌더링 (신고/정지 버튼 포함)
  const renderUser = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Text>{item.name || item.email}</Text>
      <Text>온라인 상태: {item.isOnline ? '온라인' : '오프라인'}</Text>
      <Text>
        마지막 활동:{' '}
        {item.lastActiveAt
          ? new Date(item.lastActiveAt.seconds * 1000).toLocaleString()
          : '정보 없음'}
      </Text>
      {item.isSuspended && <Text style={{ color: 'red' }}>정지됨</Text>}
      <Button title="신고/정지" onPress={() => reportUserAndSuspend(item.id)} />
    </View>
  );

  // 채팅 목록 렌더링
  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
      onPress={() => setSelectedChat(item)}
    >
      <Text>채팅방 ID: {item.id}</Text>
      <Text>마지막 메시지: {item.lastMessage || '없음'}</Text>
    </TouchableOpacity>
  );

  // 신고 내역 렌더링
  const renderReport = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Text>신고 대상 사용자: {item.reportedUserId}</Text>
      <Text>신고 사유: {item.reportReason}</Text>
      <Text>
        신고 시각:{' '}
        {item.reportedAt
          ? new Date(item.reportedAt.seconds * 1000).toLocaleString()
          : 'N/A'}
      </Text>
      <Text>처리 상태: {item.status}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        관리자 대시보드
      </Text>
      
      <Text style={{ fontSize: 20, marginBottom: 5 }}>사용자 목록</Text>
      <FlatList data={users} keyExtractor={item => item.id} renderItem={renderUser} />
      
      <Text style={{ fontSize: 20, marginVertical: 10 }}>채팅 목록</Text>
      <FlatList data={chats} keyExtractor={item => item.id} renderItem={renderChat} />
      
      {selectedChat && (
        <View style={{ marginTop: 20, borderWidth: 1, borderColor: '#ccc', padding: 10 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            채팅방 상세 보기 ({selectedChat.id})
          </Text>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Text>{item.senderId}: {item.text}</Text>
            )}
          />
          <Button title="닫기" onPress={() => setSelectedChat(null)} />
        </View>
      )}

      <Text style={{ fontSize: 20, marginVertical: 10 }}>신고 내역</Text>
      <FlatList data={reports} keyExtractor={item => item.id} renderItem={renderReport} />
    </View>
  );
};

export default AdminDashboardScreen;
