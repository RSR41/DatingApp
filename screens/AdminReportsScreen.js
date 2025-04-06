// DatingApp/screens/AdminReportsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AdminReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firestore의 reports 컬렉션을 실시간 구독하여 신고 내역을 가져옵니다.
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(reportList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 관리자가 신고된 유저를 영구 탈퇴시키는 함수
  const handleBanUser = (report) => {
    Alert.alert(
      '사용자 영구 탈퇴',
      `신고 대상 사용자 (${report.reportedUserId})를 영구 탈퇴시키겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          onPress: async () => {
            try {
              // 1. 사용자 문서 업데이트: 해당 사용자의 isSuspended 필드를 true로 설정하고, 추가 정보를 기록합니다.
              await updateDoc(doc(db, 'users', report.reportedUserId), {
                isSuspended: true,
                banReason: report.reportReason, // 신고 사유를 banReason으로 기록 (선택 사항)
                banDate: new Date(),
              });
              // 2. 신고 문서 업데이트: 상태를 'banned'로 변경하여 처리되었음을 기록합니다.
              await updateDoc(doc(db, 'reports', report.id), {
                status: 'banned',
              });
              Alert.alert('처리 완료', '해당 사용자가 영구 탈퇴 처리되었습니다.');
            } catch (error) {
              console.error('영구 탈퇴 처리 중 오류:', error);
              Alert.alert('오류', '사용자 탈퇴 처리 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // 신고 내역 항목 렌더링 함수
  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>신고 ID: {item.id}</Text>
      <Text>신고 대상: {item.reportedUserId}</Text>
      <Text>신고 사유: {item.reportReason}</Text>
      <Text>
        신고 시각:{" "}
        {item.reportedAt ? new Date(item.reportedAt.seconds * 1000).toLocaleString() : 'N/A'}
      </Text>
      <Text>처리 상태: {item.status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="영구 탈퇴" onPress={() => handleBanUser(item)} />
      </View>
    </View>
  );

  if (loading) {
    return <Text>로딩 중...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>신고 내역 목록</Text>
      {reports.length === 0 ? (
        <Text>신고 내역이 없습니다.</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  reportCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  reportTitle: { fontSize: 18, fontWeight: 'bold' },
  buttonContainer: { marginTop: 8 },
});

export default AdminReportsScreen;
