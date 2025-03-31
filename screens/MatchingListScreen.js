// screens/MatchingListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const MatchingListScreen = () => {
  const [matches, setMatches] = useState([]);   // 매칭된 유저와 그 외 유저를 합친 배열
  const [matchedCount, setMatchedCount] = useState(0); // 매칭된 유저 수 (스타일 적용용)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        // 1. 현재 로그인한 사용자의 Firestore 문서 가져오기
        const currentUserDoc = await getDoc(doc(db, 'users', uid));
        if (!currentUserDoc.exists()) return;
        const currentUser = currentUserDoc.data();

        // 2. 전체 사용자 데이터 가져오기
        const querySnapshot = await getDocs(collection(db, 'users'));
        const matched = [];
        const nonMatched = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const id = docSnap.id;

          // 자기 자신 제외
          if (id === uid) return;

          // 선호 조건 비교
          // 성별 조건: 만약 currentUser.preferredGender가 '상관없음'이면 true, 아니면 일치해야 함
          const genderMatch =
            currentUser.preferredGender === '상관없음' ||
            data.gender === currentUser.preferredGender;

          const ageMatch =
            data.age >= currentUser.preferredAgeMin &&
            data.age <= currentUser.preferredAgeMax;

          const locationMatch =
            data.location === currentUser.preferredLocation;

          const isMatch = genderMatch && ageMatch && locationMatch;

          if (isMatch) {
            matched.push({ id, ...data });
          } else {
            nonMatched.push({ id, ...data });
          }
        });

        setMatchedCount(matched.length);
        // 매칭된 유저를 먼저, 그 뒤에 나머지 유저를 추가하여 전체 배열 구성
        setMatches([...matched, ...nonMatched]);
      } catch (error) {
        console.error('매칭 유저 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // 유저 아이템 렌더링 함수
  const renderUser = ({ item, index }) => {
    // index가 matchedCount 미만이면 매칭된 유저로 간주하여 스타일 적용
    const isMatched = index < matchedCount;
    return (
      <View style={[styles.card, isMatched && styles.matchedCard]}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>나이: {item.age}</Text>
        <Text>성별: {item.gender}</Text>
        <Text>지역: {item.location}</Text>
        <Text>소개: {item.bio}</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>매칭된 유저 목록</Text>
      {matches.length === 0 ? (
        <Text>조건에 맞는 유저가 없습니다.</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  matchedCard: {
    borderColor: 'green', // 매칭된 유저는 녹색 테두리로 강조
    backgroundColor: '#eaffea',
  },
  name: { fontSize: 18, fontWeight: 'bold' },
});

export default MatchingListScreen;
