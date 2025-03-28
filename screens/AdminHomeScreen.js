// screens/AdminHomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍💻 관리자 메인 화면입니다</Text>
      <Text>관리자 전용 기능이 여기에 표시됩니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AdminHomeScreen;
