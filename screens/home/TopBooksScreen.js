import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, ActivityIndicator,
  Modal, TouchableOpacity, ScrollView
} from 'react-native';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function TopBooksScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    setLoading(true);
    const booksRef = collection(db, 'books');
    const q = query(
      booksRef,
      where('likes', '>', 0),
      orderBy('likes', 'desc'),
      limit(20)
    );

    // Gerçek zamanlı dinleme
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(results);
      setLoading(false);
    }, (error) => {
      console.error('TopBooks gerçek zamanlı dinleme hatası:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openBookModal = (book) => {
    setSelectedBook(book);
    setBookModalVisible(true);
  };

  const closeBookModal = () => {
    setSelectedBook(null);
    setBookModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const title = item.title?.trim() || 'Başlık Bilgisi Yok';
    const author = item.author?.trim() || 'Yazar Bilgisi Yok';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openBookModal(item)}
        activeOpacity={0.8}
      >
        {item.coverImageUrl ? (
          <Image
            source={{ uri: item.coverImageUrl }}
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
      </TouchableOpacity>
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
      <Text style={styles.header}>En Çok Beğenilen Kitaplar</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={bookModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBookModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={closeBookModal}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>{selectedBook?.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {selectedBook?.author}</Text>

              {selectedBook?.coverImageUrl ? (
                <Image
                  source={{ uri: selectedBook.coverImageUrl }}
                  style={styles.modalCover}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={styles.modalDescription}>
                {selectedBook?.description
                  ?? selectedBook?.bookDescription
                  ?? 'Açıklama bulunamadı.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
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
    paddingHorizontal: 0,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    alignItems: 'center',
    padding: 10,
  },
  cover: {
    width: 80,
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
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
    paddingLeft: 12,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalAuthor: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCover: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'justify',
    color: 'gray',
  },
});
