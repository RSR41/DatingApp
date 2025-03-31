// reportUserAndSuspend.js (새로운 파일을 만들거나, AdminDashboardScreen.js 내부에 작성 가능)
import { Alert } from 'react-native';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

/**
 * 특정 사용자를 신고하고, 정지 처리하며,
 * 그 내역을 reports 컬렉션에 기록하는 함수
 * 
 * @param {string} userId 신고/정지할 대상 사용자 UID
 * @param {string} reportReason 신고 사유
 */
export async function reportUserAndSuspend(userId, reportReason = '불건전한 대화') {
  Alert.alert(
    '사용자 신고',
    `사유: ${reportReason}\n해당 사용자를 정지하시겠습니까?`,
    [
      { text: '취소', style: 'cancel' },
      {
        text: '정지',
        onPress: async () => {
          try {
            // 1. reports 컬렉션에 신고 기록 생성
            await addDoc(collection(db, 'reports'), {
              reporterId: auth.currentUser ? auth.currentUser.uid : 'admin',
              reportedUserId: userId,
              reportReason,
              reportedAt: serverTimestamp(),
              status: 'pending', // 추후 처리(승인/반려 등) 후 업데이트 가능
            });

            // 2. 해당 사용자를 정지 처리 (users/{userId} 문서의 isSuspended = true)
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
    ],
  );
}
