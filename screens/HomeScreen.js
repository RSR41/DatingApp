import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth'; // 로그아웃 함수
import { auth } from '../services/firebase'; // 인증 객체
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Login'); // 로그아웃 후 로그인 화면으로 이동
      })
      .catch((error) => {
        console.error('로그아웃 실패:', error);
        Alert.alert('오류', '로그아웃에 실패했습니다.');
      });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 홈 화면입니다!</Text>
      <Button title="로그아웃" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default HomeScreen;
