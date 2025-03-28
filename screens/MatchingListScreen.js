// screens/MatchingListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const MatchingListScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        // 현재 유저 정보 가져오기
        const userDocSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', uid)));
        if (userDocSnap.empty) return;
        const currentUser = userDocSnap.docs[0].data();

        // 조건에 맞는 유저들 찾기
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const filtered = [];

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const id = docSnap.id;

          // 자기 자신 제외
          if (id === uid) return;

          // 조건 필터링
          const match =
            data.gender === currentUser.preferredGender &&
            data.age >= currentUser.preferredAgeMin &&
            data.age <= currentUser.preferredAgeMax &&
            data.location === currentUser.preferredLocation;

          if (match) filtered.push({ id, ...data });
        });

        setMatches(filtered);
      } catch (error) {
        console.error('매칭 유저 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>나이: {item.age}</Text>
              <Text>성별: {item.gender}</Text>
              <Text>지역: {item.location}</Text>
              <Text>소개: {item.bio}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
});

export default MatchingListScreen;
