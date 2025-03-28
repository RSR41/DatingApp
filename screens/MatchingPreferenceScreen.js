// screens/MatchingPreferenceScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

const MatchingPreferenceScreen = () => {
  const navigation = useNavigation();

  // 입력 상태값
  const [preferredGender, setPreferredGender] = useState('');
  const [preferredAgeMin, setPreferredAgeMin] = useState('');
  const [preferredAgeMax, setPreferredAgeMax] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [interests, setInterests] = useState('');

  const handleSavePreferences = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert('오류', '로그인된 사용자가 없습니다.');
      return;
    }

    if (!preferredGender || !preferredAgeMin || !preferredAgeMax || !preferredLocation) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        preferredGender,
        preferredAgeMin: Number(preferredAgeMin),
        preferredAgeMax: Number(preferredAgeMax),
        preferredLocation,
        interests: interests.split(',').map((item) => item.trim()),
      });

      Alert.alert('저장 완료', '선호 조건이 저장되었습니다.');
      navigation.replace('Home');
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>매칭 선호 조건 입력</Text>

      <TextInput
        placeholder="선호 성별 (남자 / 여자 / 상관없음)"
        style={styles.input}
        value={preferredGender}
        onChangeText={setPreferredGender}
      />
      <TextInput
        placeholder="선호 최소 나이"
        style={styles.input}
        keyboardType="numeric"
        value={preferredAgeMin}
        onChangeText={setPreferredAgeMin}
      />
      <TextInput
        placeholder="선호 최대 나이"
        style={styles.input}
        keyboardType="numeric"
        value={preferredAgeMax}
        onChangeText={setPreferredAgeMax}
      />
      <TextInput
        placeholder="선호 지역 (예: 서울)"
        style={styles.input}
        value={preferredLocation}
        onChangeText={setPreferredLocation}
      />
      <TextInput
        placeholder="관심사 (쉼표로 구분: 여행,운동,독서)"
        style={styles.input}
        value={interests}
        onChangeText={setInterests}
      />

      <Button title="저장하기" onPress={handleSavePreferences} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
});

export default MatchingPreferenceScreen;
