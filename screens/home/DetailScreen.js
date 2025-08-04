import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Keyboard,
} from 'react-native';
import { FavoritesContext } from '../../context/FavoritesContext';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, Timestamp, increment } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import Octicons from '@expo/vector-icons/Octicons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';

const cleanDocId = (title) => {
  if (!title) return 'unknown';
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  id = id.replace(/^-+|-+$/g, '');
  return id || 'unknown';
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function ErrorModal({ visible, message, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.errorModalContainer}>
          <Text style={styles.errorModalTitle}>Hata</Text>
          <Text style={styles.errorModalMessage}>{message}</Text>
          <Pressable style={styles.errorModalButton} onPress={onClose}>
            <Text style={styles.errorModalButtonText}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function DetailScreen({ route, navigation }) {
  const { book } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { addFavorite, addLikedBook } = useContext(FavoritesContext);

  const [favoriteLoading, setFavoriteLoading] = useState(false);



  const showFeedback = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const handleLike = async () => {
    if (!user) {
      showFeedback('Lütfen giriş yapınız.');
      return;
    }

    try {
      await updateDoc(bookDocRef, {
        likes: increment(1),
        likesHistory: arrayUnion(Timestamp.now()),
      });
      showFeedback('Kitabı beğendiniz!');
    } catch (error) {
      showFeedback('Beğenirken hata oluştu.');
    }
  };

  const handleDislike = async () => {
    try {
      await updateDoc(bookDocRef, {
        dislikes: increment(1),
      });
      showFeedback('Kitabı beğenmediniz.');
    } catch (error) {
      showFeedback('Beğenmeme sırasında hata oluştu.');
    }
  };

  const handleAddFavorite = async () => {
    if (!user) {
      showFeedback('Lütfen giriş yapınız.');
      return;
    }
    if (book) {
      try {
        await addFavorite(book); // Burada sadece context fonksiyonunu çağır
        showFeedback('Kitap favorilere eklendi!');
      } catch (error) {
        showFeedback('Favorilere eklenirken hata oluştu.');
      }
    }
  };


  const docId = useMemo(() => cleanDocId(book?.title), [book?.title]);
  const bookDocRef = useMemo(() => doc(db, 'books', docId), [docId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(bookDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setComments((data.comments || []).filter(item => item.id));
          setQuotes((data.quotes || []).filter(item => item.id));
        } else {
          await setDoc(bookDocRef, {
            title: book.title,
            author: book.author,
            coverImageUrl: book.coverImageUrl || null,
            comments: [],
            quotes: [],
          });
          setComments([]);
          setQuotes([]);
        }
      } catch (error) {
        showError('Kitap verileri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [bookDocRef]);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardOffset(event.endCoordinates.height + 20);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorVisible(true);
  };

  const addEntry = async (type, text) => {
    const trimmed = text.trim();
    if (!trimmed) return showError(`${type === 'comments' ? 'Yorum' : 'Alıntı'} boş olamaz.`);
    if (!user) return showError('Kullanıcı bilgisi alınamadı. Lütfen giriş yapınız.');
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const username = userDoc.exists() ? userDoc.data().username || 'Anonim' : 'Anonim';
      const newEntry = { id: generateUUID(), userId: user.uid, username, text: trimmed };
      await updateDoc(bookDocRef, { [type]: arrayUnion(newEntry) });
      if (type === 'comments') {
        setComments((prev) => [...prev, newEntry]);
        setNewComment('');
      } else {
        setQuotes((prev) => [...prev, newEntry]);
        setNewQuote('');
      }
      Keyboard.dismiss();
    } catch (error) {
      showError(`${type === 'comments' ? 'Yorum' : 'Alıntı'} eklenirken hata oluştu.`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listText}>{item.text}</Text>
      <Text style={styles.userText}>— {item.username || 'Anonim'}</Text>
    </View>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kitap Detayı</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.bookInfo}>
            <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
              {book.coverImageUrl ? (
                <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.noCover]}>
                  <Text style={styles.noCoverText}>Kapak Yok</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.bookTextInfo}>
              <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
                <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
                  {book.title}
                </Text>
              </TouchableOpacity>
              <Text style={styles.bookAuthor}>{book.author}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLike} style={[styles.iconBox, { backgroundColor: '#e6f7e6' }]}>
                  <Octicons name="thumbsup" size={22} color="#34a853" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDislike} style={[styles.iconBox, { backgroundColor: '#ffeaea' }]}>
                  <Octicons name="thumbsdown" size={22} color="#ea4335" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddFavorite}
                  disabled={favoriteLoading}
                  style={[styles.iconBox, { backgroundColor: '#ffe5f0' }]}
                >
                  <Ionicons name="heart" size={22} color="#d60056" />
                </TouchableOpacity>

              </View>
            </View>
          </View>

          <View style={styles.tabBar}>
            {['comments', 'quotes'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.tabButton, activeTab === type && styles.activeTab]}
                onPress={() => setActiveTab(type)}
              >
                <Text style={[styles.tabText, activeTab === type && styles.activeTabText]}>
                  {type === 'comments' ? 'Yorumlar' : 'Alıntılar'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="red" style={{ marginTop: 20 }} />
          ) : (
            <>
              <FlatList
                data={(activeTab === 'comments' ? comments : quotes).slice(-10)}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ fontSize: SCREEN_WIDTH * 0.045, color: 'gray' }}>
                      {activeTab === 'comments'
                        ? 'Henüz yorum yapılmadı.'
                        : 'Henüz alıntı yapılmadı.'}
                    </Text>
                  </View>
                )}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: 30,
                }}
                keyboardShouldPersistTaps="handled"
              />

              <View style={[styles.inputContainer, { marginBottom: keyboardOffset + 10 }]}>
                <TextInput
                  style={styles.input}
                  placeholder={`Yeni ${activeTab === 'comments' ? 'yorum' : 'alıntı'} ekle...`}
                  value={activeTab === 'comments' ? newComment : newQuote}
                  onChangeText={activeTab === 'comments' ? setNewComment : setNewQuote}
                  multiline
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addEntry(activeTab, activeTab === 'comments' ? newComment : newQuote)}
                >
                  <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>


      <Modal visible={titleModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setTitleModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.modalTitle}>{book.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {book.author}</Text>
              <Text style={styles.modalDescription}>
                {book.description || 'Açıklama bulunmuyor.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>


      <ErrorModal visible={errorVisible} message={errorMessage} onClose={() => setErrorVisible(false)} />
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  bookInfo: {
    flexDirection: 'row',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cover: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_HEIGHT * 0.18,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    color: '#999',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  bookTextInfo: {
    flex: 1,
    marginLeft: SCREEN_WIDTH * 0.04,
  },
  bookTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.005,
    color: '#222',
  },
  bookAuthor: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: 'gray',
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: 'red',
  },
  tabText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: 'gray',
  },
  activeTabText: {
    color: 'red',
    fontWeight: 'bold',
  },
  listItem: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 6,
    marginHorizontal: SCREEN_WIDTH * 0.05,
  },
  listText: {
    fontSize: SCREEN_WIDTH * 0.042,
    color: '#333',
  },
  userText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: 'gray',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: SCREEN_WIDTH * 0.042,
    color: '#000000ff',
    maxHeight: 100,
  },
  addButton: {
    backgroundColor: 'red',
    borderRadius: 25,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalAuthor: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: SCREEN_WIDTH * 0.04,
    lineHeight: 22,
    textAlign: 'left',
  },
  errorModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: SCREEN_HEIGHT * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    width: '100%',
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.015,
    color: 'red',
  },
  errorModalMessage: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  errorModalButton: {
    backgroundColor: 'red',
    borderRadius: 25,
    paddingVertical: SCREEN_HEIGHT * 0.012,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  errorModalButtonText: {
    color: 'white',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 16,
  },
  iconBox: {
    marginRight: 14,
    padding: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
