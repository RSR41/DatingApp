// screens/ProfileSetupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');

  const handleSave = async () => {
    if (nickname.trim() === '' || bio.trim() === '') {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      await setDoc(doc(db, 'users', userId), {
        nickname,
        bio,
        createdAt: new Date(),
      });

      Alert.alert('완료', '프로필이 저장되었습니다!');
      navigation.replace('Home'); // 설정 완료 후 홈으로 이동
    } catch (error) {
      console.error(error);
      Alert.alert('저장 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 설정</Text>
      <TextInput
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />
      <TextInput
        placeholder="자기소개"
        value={bio}
        onChangeText={setBio}
        style={styles.input}
        multiline
      />
      <Button title="저장하기" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold'
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 8
  },
});

export default ProfileSetupScreen;
