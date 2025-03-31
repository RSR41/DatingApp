// DatingApp/screens/ChatScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../services/firebase'; 
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const ChatScreen = () => {
  // route.params로 넘어온 matchedUser(상대방 정보) 받기
  const route = useRoute();
  const { matchedUser } = route.params;  // MatchingListScreen에서 넘겨준 유저 정보
  
  // 현재 로그인한 사용자 정보
  const currentUser = auth.currentUser;
  
  // 메시지 목록 (Firestore에서 가져와 저장)
  const [messages, setMessages] = useState([]);
  // 텍스트 입력창 값
  const [text, setText] = useState('');

  // 1:1 채팅방을 구분하기 위한 conversationId
  // 예: uid1_uid2 (문자열 비교로 앞뒤 정렬 고정)
  const getConversationId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };
  const conversationId = getConversationId(currentUser.uid, matchedUser.uid);

  // (1) 채팅 메시지 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, 'chats', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    // onSnapshot: Firestore 변경사항을 실시간으로 수신
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [conversationId]);

  // (2) 메시지 전송 함수
  const sendMessage = async () => {
    // 공백 메시지 방지
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, 'chats', conversationId, 'messages'), {
        text,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      // 전송 후 입력창 비우기
      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // (3) 메시지 렌더링
  const renderItem = ({ item }) => {
    // 현재 사용자가 보낸 메시지인지 구분
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
      {/* 상대방 이름이 있다면 표시 */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {matchedUser?.name}님과의 채팅
      </Text>

      {/* 메시지 리스트 */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />

      {/* 입력창 + 전송 버튼 */}
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
