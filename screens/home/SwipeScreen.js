import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { FavoritesContext } from '../../context/FavoritesContext';
import { fetchBooksFromBackend } from '../../services/booksAPI';

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';

const cleanDocId = (title) => {
  if (!title) return 'unknown';
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  id = id.replace(/^-+|-+$/g, '');
  return id || 'unknown';
};

export default function SwipeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookDescription, setBookDescription] = useState('');
  const [titleModalVisible, setTitleModalVisible] = useState(false);

  const { addFavorite } = useContext(FavoritesContext);
  const position = useRef(new Animated.ValueXY()).current;

  const currentBook = books[currentIndex] || null;

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      const bookList = await fetchBooksFromBackend(); // kendi API'nden çekiliyor
      setBooks(bookList);
      setLoading(false);
    };
    loadBooks();
  }, []);

  const showNextBook = () => {
    setCurrentIndex(prev => prev + 1);
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
          coverImageUrl: book.coverImageUrl || null,
          description: book.description || '',
        });
      } else {
        await setDoc(bookDocRef, {
          title: book.title,
          author: book.author || 'Bilinmiyor',
          coverImageUrl: book.coverImageUrl || null,
          likes: field === 'likes' ? incrementValue : 0,
          dislikes: field === 'dislikes' ? incrementValue : 0,
          description: book.description || '',
        });
      }
    } catch (error) {
      console.error('Firestore update error:', error);
    }
  };

  // Like butonuna basınca sadece like arttır ve sonraki kitaba geç
  const handleThumbsUp = async () => {
    if (currentBook) {
      await updateBookScore(currentBook, 'likes', 1);
    }
    Animated.timing(position, {
      toValue: { x: 500, y: 0 },
      duration: 400, // biraz yavaşlatıldı
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
    });
  };

  // Dislike butonu
  const handleDislike = async () => {
    if (currentBook) {
      await updateBookScore(currentBook, 'dislikes', 1);
    }
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 400, // biraz yavaşlatıldı
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
    });
  };

  // Kalp butonu: favorilere ekle ve sonraki kitaba geç (animasyon yana doğru)
  const handleAddFavorite = () => {
    if (currentBook) {
      addFavorite(currentBook);
      Animated.timing(position, {
        toValue: { x: 500, y: 0 }, // yana doğru animasyon
        duration: 400, // biraz yavaşlatıldı
        useNativeDriver: false,
      }).start(() => {
        position.setValue({ x: 0, y: 0 });
        showNextBook();
      });
    }
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

  const fetchDescription = () => {
    if (!currentBook) return;
    setBookDescription(currentBook.description || 'Kitap hakkında bilgi yok.');
    setModalVisible(true);
  };

  const handleReportPress = () => {
    const email = 'info.swipeitofficial@gmail.com';
    const subject = encodeURIComponent(`Kitap Hatası Bildirimi: ${currentBook?.title || ''}`);
    const body = encodeURIComponent(
      `Merhaba,\n\n"${currentBook?.title || ''}" adlı kitapla ilgili bir hata veya sorun bildirmek istiyorum.\n\nLütfen detayları buraya yazınız...\n`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Hata', 'E-posta gönderme özelliği desteklenmiyor.');
        } else {
          return Linking.openURL(mailtoUrl);
        }
      })
      .catch((err) => Alert.alert('Hata', 'E-posta gönderilirken bir hata oluştu.'));
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
        <Image
          source={require('../../assets/swipeitlogo.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.bookInfo}>
        <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
          <Text
            style={styles.bookTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentBook.title}
          </Text>
        </TouchableOpacity>
        <Text style={styles.author}>{currentBook.author}</Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, { transform: position.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        >
          {currentBook.coverImageUrl ? (
            <Image
              source={{ uri: currentBook.coverImageUrl }}
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

        {/* Report icon cardın sağ üst köşesinde */}
        <TouchableOpacity onPress={handleReportPress} style={styles.reportButton}>
          <Ionicons name="alert-circle-outline" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.swipeButtons}>
        <TouchableOpacity onPress={handleDislike} style={styles.swipeButton}>
          <Octicons name="thumbsdown" size={30} color="red" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddFavorite} style={styles.swipeButton}>
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
            <ScrollView>
              <Text style={styles.modalTitle}>{currentBook.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {currentBook.author}</Text>
              <Text style={styles.modalDescription}>{bookDescription}</Text>
            </ScrollView>
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
  cardContainer: {
    width: '80%',
    height: 420,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  reportButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 20,
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
