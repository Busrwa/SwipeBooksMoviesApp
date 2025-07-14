import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Animated, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { FavoritesContext } from '../../context/FavoritesContext';

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';

const cleanDocId = (title) => {
  if (!title) return 'unknown';
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  id = id.replace(/^-+|-+$/g, '');
  if (!id) return 'unknown';
  return id;
};

export default function SwipeScreen({ navigation }) {
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookDescription, setBookDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(false);

  const { addFavorite } = useContext(FavoritesContext);
  const position = useRef(new Animated.ValueXY()).current;

  const fetchNextBook = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=Türkçe&limit=1&page=${pageNum}`);
      const json = await res.json();
      if (json.docs && json.docs.length > 0) {
        const book = json.docs[0];
        setCurrentBook({
          title: book.title,
          author: book.author_name ? book.author_name[0] : 'Bilinmiyor',
          coverId: book.cover_i,
        });
      } else {
        setCurrentBook(null);
      }
    } catch (error) {
      console.error('Kitap çekme hatası:', error);
      setCurrentBook(null);
    } finally {
      setLoading(false);
      position.setValue({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    fetchNextBook(page);
  }, [page]);

  const showNextBook = () => {
    setPage(prev => prev + 1);
  };

  const updateBookScore = async (book, field, incrementValue) => {
    if (!book || !book.title) return;
    const docId = cleanDocId(book.title);
    const bookDocRef = doc(db, 'books', docId);

    try {
      const docSnap = await getDoc(bookDocRef);
      if (docSnap.exists()) {
        await updateDoc(bookDocRef, {
          [field]: increment(incrementValue),
          title: book.title,
          author: book.author || 'Bilinmiyor',
          coverId: book.coverId || null,
        });
      } else {
        await setDoc(bookDocRef, {
          title: book.title,
          author: book.author || 'Bilinmiyor',
          coverId: book.coverId || null,
          likes: field === 'likes' ? incrementValue : 0,
          dislikes: field === 'dislikes' ? incrementValue : 0,
        });
      }
    } catch (error) {
      console.error('Firestore update error:', error);
    }
  };

  const handleThumbsUp = async () => {
    if (currentBook) {
      addFavorite(currentBook);
      await updateBookScore(currentBook, 'likes', 1);
    }
    Animated.timing(position, {
      toValue: { x: 500, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      showNextBook();
    });
  };

  const handleDislike = async () => {
    if (currentBook) {
      await updateBookScore(currentBook, 'dislikes', 1);
    }
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      showNextBook();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: async (_, gesture) => {
        if (gesture.dx > 120) {
          await handleThumbsUp();
        } else if (gesture.dx < -120) {
          await handleDislike();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const fetchDescription = async () => {
    if (!currentBook) return;

    setModalLoading(true);
    setModalVisible(true);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(currentBook.title)}&author=${encodeURIComponent(currentBook.author)}&limit=1`
      );
      const json = await res.json();
      if (json.docs && json.docs.length > 0) {
        const doc = json.docs[0];
        const desc =
          doc.first_sentence?.[0] ||
          doc.subtitle ||
          (doc.subject ? doc.subject.join(', ') : null) ||
          'Kitap hakkında bilgi bulunamadı.';
        setBookDescription(desc);
      } else {
        setBookDescription('Kitap hakkında bilgi bulunamadı.');
      }
    } catch (error) {
      setBookDescription('Detay bilgisi alınırken hata oluştu.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text>Kitaplar yükleniyor...</Text>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Gösterilecek kitap kalmadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/swipeitlogo.png')} style={styles.logo} />
      </View>

      <View style={styles.bookInfo}>
        <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
          <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentBook.title}
          </Text>
        </TouchableOpacity>
        <Text style={styles.author}>{currentBook.author}</Text>
      </View>

      <Animated.View
        style={[styles.card, { transform: position.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        {currentBook.coverId ? (
          <Image
            source={{ uri: `https://covers.openlibrary.org/b/id/${currentBook.coverId}-L.jpg` }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require('../../assets/swipeitlogo.png')}
            style={styles.cover}
            resizeMode="cover"
          />
        )}
      </Animated.View>

      <View style={styles.swipeButtons}>
        <TouchableOpacity onPress={handleDislike} style={styles.swipeButton}>
          <Octicons name="thumbsdown" size={30} color="red" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleThumbsUp} style={styles.swipeButton}>
          <Ionicons name="heart-outline" size={30} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleThumbsUp} style={styles.swipeButton}>
          <Octicons name="thumbsup" size={30} color="green" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.learnMore} onPress={fetchDescription}>
        <Text style={styles.learnMoreText}>Daha Fazla Ayrıntı</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            {modalLoading ? (
              <ActivityIndicator size="large" color="red" />
            ) : (
              <ScrollView>
                <Text style={styles.modalTitle}>{currentBook.title}</Text>
                <Text style={styles.modalAuthor}>Yazar: {currentBook.author}</Text>
                <Text style={styles.modalDescription}>{bookDescription}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={titleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { maxHeight: '30%' }]}>
            <TouchableOpacity
              onPress={() => setTitleModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            <ScrollView>
              <Text style={[styles.modalTitle, { fontSize: 20 }]}>
                {currentBook.title}
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingBottom: 120,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
    marginRight: 8,
  },
  bookInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
  },
  author: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  card: {
    width: '80%',
    height: 420,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  swipeButtons: {
    bottom: 85,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  swipeButton: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  learnMore: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  learnMoreText: {
    color: '#fff',
    marginRight: 8,
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
  },
  modalAuthor: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
});
