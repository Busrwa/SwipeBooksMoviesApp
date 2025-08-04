import React, { useEffect, useState, memo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { collection, query, orderBy, limit, where, onSnapshot, Timestamp, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '../../context/FavoritesContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');



// Özel alert modal bileşeni
function CustomAlertModal({ visible, title, message, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.customModalBackground}>
        <View style={styles.customModalContainer}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const BookCard = memo(({ item, onPress, onAddFavorite }) => {
  const title = item.title?.trim() || 'Başlık Bilgisi Yok';
  const author = item.author?.trim() || 'Yazar Bilgisi Yok';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {item.coverImageUrl ? (
        <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Text style={styles.noCoverText}>Kapak Yok</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.author}>{author}</Text>
        <View style={styles.stats}>
          <Ionicons name="heart" size={18} color="red" />
          <Text style={styles.likes}>{item.likes || 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          onAddFavorite(item);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.8}
      >
        <Ionicons name="heart" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function TopBooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const { addFavorite, favorites } = useContext(FavoritesContext);

  const [activeTab, setActiveTab] = useState('allTime'); // 'allTime' veya 'weekly'

  useEffect(() => {
    setLoading(true);
    const booksRef = collection(db, 'books');

    const unsubscribe = onSnapshot(
      booksRef,
      (querySnapshot) => {
        const now = new Date();

        function getMondayUTC(date) {
          const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
          const day = utcDate.getUTCDay();
          const diff = (day === 0 ? -6 : 1) - day;
          utcDate.setUTCDate(utcDate.getUTCDate() + diff);
          utcDate.setUTCHours(0, 0, 0, 0);
          return utcDate;
        }

        function getSundayEndUTC(mondayDate) {
          const sunday = new Date(mondayDate);
          sunday.setUTCDate(mondayDate.getUTCDate() + 6);
          sunday.setUTCHours(23, 59, 59, 999);
          return sunday;
        }


        const monday = getMondayUTC(now);
        const sundayEnd = getSundayEndUTC(monday);

        const allBooks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const likesHistory = data.likesHistory || [];

          let weeklyLikes = 0;

          if (Array.isArray(likesHistory)) {
            weeklyLikes = likesHistory.filter(ts => {
              const dateObj = ts?.toDate?.();
              return dateObj && dateObj >= monday && dateObj <= sundayEnd;
            }).length;
          }

          return {
            id: doc.id,
            ...data,
            weeklyLikes,
          };
        });

        const results = activeTab === 'weekly'
          ? allBooks
            .filter(book => (book.weeklyLikes || 0) > 0)
            .sort((a, b) => b.weeklyLikes - a.weeklyLikes)
            .slice(0, 10)
          : allBooks
            .filter(book => book.likes > 0)
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 10);

        setBooks(results);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore sorgu hatası:', error);
        showAlert('Hata', 'Kitaplar yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeTab]);


  const openBookModal = (book) => {
    setSelectedBook(book);
    setBookModalVisible(true);
  };

  const closeBookModal = () => {
    setSelectedBook(null);
    setBookModalVisible(false);
  };

  const prepareBookForNavigation = (book) => {
    if (!book) return null;
    return {
      ...book,
      createdAt: book.createdAt
        ? (book.createdAt.toDate ? book.createdAt.toDate().toISOString() : (book.createdAt instanceof Date ? book.createdAt.toISOString() : book.createdAt))
        : null,
      // Burada başka Date/Timestamp varsa onları da dönüştür
    };
  };


  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const addToFavorites = (book) => {
    if (favorites.find((fav) => fav.id === book.id)) {
      showAlert('Bilgi', 'Bu kitap zaten favorilerinizde.');
      return;
    }
    addFavorite(book);
    showAlert('Başarılı', `"${book.title}" favorilere eklendi.`);
  };

  const renderItem = ({ item }) => {
    return <BookCard item={item} onPress={openBookModal} onAddFavorite={addToFavorites} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/loading.json')}  // animasyon dosyanın yolu
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={{ marginTop: 10, fontSize: 16, color: 'gray' }}>
          En çok beğenilen kitaplar yükleniyor...
        </Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Sekme çubuğu */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
            Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'allTime' && styles.activeTab]}
          onPress={() => setActiveTab('allTime')}
        >
          <Text style={[styles.tabText, activeTab === 'allTime' && styles.activeTabText]}>
            Tüm Zamanlar
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>
        {activeTab === 'weekly'
          ? 'Haftanın En Çok Beğenilen Kitapları'
          : 'Tüm Zamanların En Çok Beğenilen Kitapları'}
      </Text>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 50, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'gray' }}>
              {activeTab === 'weekly' ? 'Bu hafta beğenilen kitap bulunamadı.' : 'Henüz beğenilen kitap yok.'}
            </Text>
          </View>
        )}
      />

      <Modal
        visible={bookModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeBookModal}
      >
        <View style={styles.customModalBackground}>
          <View style={styles.customModalContainer}>
            <TouchableOpacity
              onPress={closeBookModal}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={32} color="#555" />
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
                {selectedBook?.description ?? selectedBook?.bookDescription ?? 'Açıklama bulunamadı.'}
              </Text>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  setBookModalVisible(false);
                  navigation.navigate('DetailScreen', {
                    book: prepareBookForNavigation(selectedBook),
                  });
                }}
              >
                <Text style={styles.detailButtonText}>Yorumlar & Alıntılar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Özel alert modal */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#E63946',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: '#E63946',
    fontWeight: 'bold',
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.06,
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
    padding: SCREEN_WIDTH * 0.03,
    position: 'relative',
  },
  cover: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_HEIGHT * 0.16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  noCover: {
    backgroundColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    color: '#888',
    fontSize: SCREEN_WIDTH * 0.035,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    paddingLeft: SCREEN_WIDTH * 0.03,
    justifyContent: 'center',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: 'gray',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    marginLeft: 6,
    fontSize: SCREEN_WIDTH * 0.045,
    color: 'red',
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    bottom: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#E63946',
    borderRadius: 25,
    padding: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  customModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  customModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    padding: SCREEN_WIDTH * 0.06,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalAuthor: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: 'gray',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCover: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.25,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
  },
  modalDescription: {
    fontSize: SCREEN_WIDTH * 0.045,
    lineHeight: SCREEN_WIDTH * 0.06,
    textAlign: 'justify',
    color: 'gray',
  },
  detailButton: {
    marginTop: 20,
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: '#E63946',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.047,
  },

  // Alert modal stilleri
  alertTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: SCREEN_WIDTH * 0.06,
  },
  alertButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: '#E63946',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.045,
  },
});
