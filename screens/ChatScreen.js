// DatingApp/screens/ChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../services/firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, getDocs, serverTimestamp, doc } from 'firebase/firestore';
// [추가] Expo Notifications import
import * as Notifications from 'expo-notifications';

const ChatScreen = () => {
  // route.params로 넘어온 matchedUser(상대방 정보) 받기
  const route = useRoute();
  const { chatId, matchedUser } = route.params;  // MatchingListScreen에서 넘겨준 유저 정보
  
  // 현재 로그인한 사용자 정보
  const currentUser = auth.currentUser;
  
  // 메시지 목록 및 텍스트 입력 상태
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // [추가] FlatList의 ref 생성 (자동 스크롤용)
  const flatListRef = useRef(null);
  // [추가] 이전 메시지 배열을 추적하기 위한 useRef
  const prevMessagesRef = useRef([]);

  // 1:1 채팅방을 구분하기 위한 conversationId (두 UID를 정렬하여 생성)
  const getConversationId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };
  const conversationId = getConversationId(currentUser.uid, matchedUser.uid);

  // [추가] 새로운 메시지 도착 시 로컬 알림 전송 함수
  const sendLocalNotificationForNewMessage = async (newMessage) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '새 메시지 도착!',
          body: newMessage.text,
        },
        trigger: null, // 즉시 실행
      });
    } catch (error) {
      console.error('알림 전송 중 오류 발생:', error);
    }
  };

  // (1) 채팅 메시지 실시간 구독, 읽음 처리, 및 새로운 메시지 감지 + 알림 전송
  useEffect(() => {
    // 읽음 처리 함수
    const markMessagesAsRead = async () => {
      if (!currentUser || !conversationId) return;

      try {
        const messagesRef = collection(db, 'chats', conversationId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (messageDoc) => {
          const data = messageDoc.data();

          if (data.senderId !== currentUser.uid) {
            const currentReadBy = data.readBy || [];
            if (!currentReadBy.includes(currentUser.uid)) {
              await updateDoc(doc(db, 'chats', conversationId, 'messages', messageDoc.id), {
                readBy: [...currentReadBy, currentUser.uid],
              });
            }
          }
        });
      } catch (error) {
        console.error('메시지 읽음 처리 중 오류:', error);
      }
    };

    markMessagesAsRead();

    // Firestore onSnapshot 구독: 메시지 실시간 업데이트 및 알림 전송
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // [추가] 새로운 메시지 감지 및 알림 전송
      if (prevMessagesRef.current.length > 0 && fetchedMessages.length > prevMessagesRef.current.length) {
        const newMessage = fetchedMessages[fetchedMessages.length - 1];
        if (newMessage.senderId !== currentUser.uid) {
          sendLocalNotificationForNewMessage(newMessage);
        }
      }
      prevMessagesRef.current = fetchedMessages;
      setMessages(fetchedMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, currentUser]);

  // [추가] messages 배열 업데이트 시 자동 스크롤
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // (2) 메시지 전송 함수
  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // 2. 채팅방 메타데이터 업데이트
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });

      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // (3) 메시지 렌더링 함수
  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    return (
      <View
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? '#DCF8C6' : '#eee',
          padding: 8,
          marginVertical: 4,
          borderRadius: 8,
          maxWidth: '70%',
        }}
      >
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {matchedUser?.name}님과의 채팅
      </Text>
      <FlatList
        ref={flatListRef}  // [추가] FlatList에 ref 연결 (자동 스크롤)
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            borderRadius: 4,
            marginRight: 8,
          }}
        />
        <Button title="전송" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;
