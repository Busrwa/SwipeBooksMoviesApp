import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function TopBooksScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopBooks = async () => {
    setLoading(true);
    try {
      const booksRef = collection(db, 'books');
      const q = query(
        booksRef,
        where('likes', '>', 0),
        orderBy('likes', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBooks(results);
    } catch (error) {
      console.error('TopBooks verisi alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopBooks();
  }, []);

  const renderItem = ({ item }) => {
    const title = item.title?.trim() || 'Başlık Bilgisi Yok';
    const author = item.author?.trim() || 'Yazar Bilgisi Yok';

    return (
      <View style={styles.card}>
        {item.coverId ? (
          <Image
            source={{ uri: `https://covers.openlibrary.org/b/id/${item.coverId}-L.jpg` }}
            style={styles.cover}
          />
        ) : (
          <View style={[styles.cover, styles.noCover]}>
            <Text style={styles.noCoverText}>Kapak Yok</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.author}>{author}</Text>
          <View style={styles.stats}>
            <Ionicons name="heart" size={18} color="red" />
            <Text style={styles.likes}>{item.likes || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text>En beğenilen kitaplar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Top Beğenilen Kitaplar</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,          // favorite ekranındaki gibi 50 yaptım
    paddingHorizontal: 20,   // favorite ekranındaki gibi 20 yaptım
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 0, // çünkü container zaten paddingHorizontal var, burada 0 bırakabiliriz
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cover: {
    width: 80,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  noCover: {
    backgroundColor: '#dcdcdc',
  },
  noCoverText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    marginLeft: 6,
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
});
