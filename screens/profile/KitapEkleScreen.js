import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function KitapEkleScreen() {
  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigation = useNavigation();

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!bookName.trim() || !author.trim() || !description.trim()) {
      showModal('Lütfen tüm alanları doldurun.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showModal('Giriş yapmış kullanıcı bulunamadı.');
      return;
    }

    const userId = currentUser.uid;
    const userEmail = currentUser.email || 'Email yok';
    const userName = currentUser.displayName || userId;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    try {
      const q = query(
        collection(db, 'data'),
        where('userId', '==', userId),
        where('createdAt', '>=', firstDayOfMonth)
      );

      const snapshot = await getDocs(q);

      if (snapshot.size >= 2) {
        showModal('Her ay en fazla 2 kitap önerisi gönderebilirsiniz.');
        return;
      }

      await addDoc(collection(db, 'data'), {
        bookName: bookName.trim(),
        author: author.trim(),
        description: description.trim(),
        userId,
        userEmail,
        userName,
        createdAt: new Date(),
      });

      showModal('Kitap öneriniz gönderildi.');
      setBookName('');
      setAuthor('');
      setDescription('');
    } catch (error) {
      showModal('Kitap önerisi gönderilemedi. Lütfen tekrar deneyiniz.');
      console.error('Kitap önerisi hata:', error);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Kitap Önerisi Gönder</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Kullanıcılar ayda en fazla 2 kitap önerisi gönderebilir.
          </Text>
          <Text style={styles.infoText}>
            Gönderdiğiniz kitaplar için içerik ve doğruluk sorumluluğu size aittir.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kitap Adı"
          placeholderTextColor="#aaa"
          value={bookName}
          onChangeText={setBookName}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Yazar Adı"
          placeholderTextColor="#aaa"
          value={author}
          onChangeText={setAuthor}
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Kitap Konusu"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          returnKeyType="done"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  formContainer: {
    width: 360,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 14,
    width: 320,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 17,
    color: '#333',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
