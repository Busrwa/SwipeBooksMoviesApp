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
  Dimensions,
  PixelRatio,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { FavoritesContext } from '../../context/FavoritesContext';
import { fetchBooksFromBackend } from '../../services/booksAPI';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';

const scale = SCREEN_WIDTH / 375; // 375 = iPhone 6/7/8 genişliği referans
import LottieView from 'lottie-react-native';


function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

import { db } from '../../services/firebase';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      const bookList = await fetchBooksFromBackend();

      // Kitapları karıştır (random sırada göster)
      const shuffled = bookList
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      setBooks(shuffled);
      setLoading(false);
    };

    loadBooks();
  }, []);

  const showNextBook = () => setCurrentIndex(prev => prev + 1);

  const updateBookScore = async (book, field, incrementValue) => {
    if (!book?.title) return;
    const docId = cleanDocId(book.title);
    const bookDocRef = doc(db, 'books', docId);

    try {
      const docSnap = await getDoc(bookDocRef);
      const commonData = {
        title: book.title,
        author: book.author || 'Bilinmiyor',
        coverImageUrl: book.coverImageUrl || null,
        description: book.description || '',
      };

      if (docSnap.exists()) {
        const updateData = {
          ...commonData,
          [field]: increment(incrementValue),
        };

        // Sadece beğeni için likesHistory'ye zaman damgası ekle
        if (field === 'likes') {
          updateData.likesHistory = arrayUnion(Timestamp.now());
        }

        await updateDoc(bookDocRef, updateData);
      } else {
        const newData = {
          ...commonData,
          likes: field === 'likes' ? incrementValue : 0,
          dislikes: field === 'dislikes' ? incrementValue : 0,
        };

        if (field === 'likes') {
          newData.likesHistory = [Timestamp.now()];
        }

        await setDoc(bookDocRef, newData);
      }
    } catch (error) {
      console.error('Firestore update error:', error);
    }
  };


  const handleThumbsUp = async () => {
    if (currentBook) await updateBookScore(currentBook, 'likes', 1);
    Animated.timing(position, {
      toValue: { x: 500, y: 0 },
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
    });
  };

  const handleDislike = async () => {
    if (currentBook) await updateBookScore(currentBook, 'dislikes', 1);
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
    });
  };

  const handleAddFavorite = () => {
    if (currentBook) {
      addFavorite(currentBook);
      Animated.timing(position, {
        toValue: { x: 500, y: 0 },
        duration: 400,
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
        if (gesture.dx > 120) await handleThumbsUp();
        else if (gesture.dx < -120) await handleDislike();
        else {
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
        if (!supported) Alert.alert('Hata', 'E-posta gönderme özelliği desteklenmiyor.');
        else return Linking.openURL(mailtoUrl);
      })
      .catch(() => Alert.alert('Hata', 'E-posta gönderilirken bir hata oluştu.'));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/loading.json')}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={{ marginTop: 10, fontSize: 16, color: 'gray' }}>Kitaplar yükleniyor...</Text>
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
          <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
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
            <Image source={{ uri: currentBook.coverImageUrl }} style={styles.cover} resizeMode="cover" />
          ) : (
            <Image source={require('../../assets/swipeitlogo.png')} style={styles.cover} resizeMode="cover" />
          )}
        </Animated.View>

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

      {/* Açıklama Modalı */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.modalTitle}>{currentBook.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {currentBook.author}</Text>
              <Text style={styles.modalDescription}>{bookDescription}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => {
                setModalVisible(false); // önce modalı kapat
                const safeBook = {
                  ...currentBook,
                  createdAt: currentBook.createdAt
                    ? (currentBook.createdAt.toDate ? currentBook.createdAt.toDate().toISOString() : currentBook.createdAt.toISOString())
                    : null,
                  // eğer başka tarih alanları varsa onları da buraya ekle
                };

                navigation.navigate('DetailScreen', { book: safeBook });

              }}
            >
              <Text style={styles.detailButtonText}>Yorumlar & Alıntılar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Başlık Modalı */}
      <Modal
        visible={titleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { maxHeight: '30%' }]}>
            <TouchableOpacity onPress={() => setTitleModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            <ScrollView>
              <Text style={[styles.modalTitle, { fontSize: 20 }]}>{currentBook.title}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SCREEN_HEIGHT * 0.05, // %5 üst boşluk
    paddingBottom: SCREEN_HEIGHT * 0.15, // %15 alt boşluk (butonlar için)
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
    marginBottom: SCREEN_HEIGHT * 0.025, // %2.5 alt boşluk
  },
  logo: {
    width: 150,
    height: 50,
  },
  bookInfo: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02, // %2 alt boşluk
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  bookTitle: {
    fontSize: SCREEN_WIDTH * 0.08,  // daha büyük
    maxWidth: SCREEN_WIDTH * 0.75,
    fontWeight: '700',
    textAlign: 'center',
  },
  author: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 4,
  },

  cardContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.55,
    marginBottom: SCREEN_HEIGHT * 0.025,
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
    top: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.02,
    zIndex: 20,
  },
  swipeButtons: {
    bottom: 85,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',  // ortaya hizala
    width: '60%',               // genişliği biraz azalt
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
    marginHorizontal: 10, // butonlar arasına boşluk
  },

  learnMore: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.04,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: 20,
    zIndex: 10,
  },
  learnMoreText: {
    color: '#fff',
    marginRight: SCREEN_WIDTH * 0.02,
    fontWeight: 'bold',
    fontSize: normalize(18),
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    padding: SCREEN_WIDTH * 0.05,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: normalize(25),
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  modalAuthor: {
    fontSize: normalize(20),
    color: 'gray',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalDescription: {
    fontSize: normalize(20),
    lineHeight: normalize(25),
  },
  detailButton: {
    marginTop: SCREEN_HEIGHT * 0.02,
    backgroundColor: 'red',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.05,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
});
