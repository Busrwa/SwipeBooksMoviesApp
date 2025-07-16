import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [username, setUsername] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      showMessage('Kullanıcı e-posta adresi bulunamadı.', 'error');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setLoading(false);
      setModalVisible(false);
      showMessage('Şifre sıfırlama maili gönderildi. Lütfen e-postanızı kontrol edin.', 'success');
    } catch (error) {
      setLoading(false);
      showMessage('Hata: ' + error.message, 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessageText(text);
    setMessageType(type);
    setMessageModalVisible(true);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      })
      .catch((error) => {
        showMessage('Çıkış yaparken hata oluştu: ' + error.message, 'error');
      });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(username && username.charAt(0).toUpperCase()) ||
              (user?.email && user.email.charAt(0).toUpperCase()) ||
              'U'}
          </Text>
        </View>
        <Text style={styles.username}>
          Merhaba {username || user?.email || 'Kullanıcı Bulunamadı'}!
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
        <Text style={styles.infoText}>Email: {user?.email || 'Bulunamadı'}</Text>
        <Text style={styles.infoText}>Kullanıcı Adı: {username || 'Bulunamadı'}</Text>
        <Text style={styles.infoText}>Üyelik Tipi: Standart</Text>
      </View>

      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.optionText}>Şifre Değiştir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.optionText}>Gizlilik Politikası</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('TermsOfUse')}>
          <Text style={styles.optionText}>Kullanım Koşulları</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('HelpSupport')}>
          <Text style={styles.optionText}>Yardım & Destek</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.optionText, { color: 'red', textAlign: 'center' }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Uygulama Versiyonu 1.0.0</Text>
      </View>

      {/* Şifre Sıfırlama Modalı */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => !loading && setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              disabled={loading}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={SCREEN_WIDTH * 0.07} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
            <Text style={styles.modalDescription}>
              Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir.
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#f44336" style={{ marginTop: 15 }} />
            ) : (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendResetEmail}>
                <Text style={styles.sendButtonText}>Gönder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Mesaj Modalı */}
      <Modal
        visible={messageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.messageModalBackground}>
          <View style={[
            styles.messageModalContainer,
            messageType === 'success' ? styles.successBackground : styles.errorBackground
          ]}>
            <Ionicons
              name={messageType === 'success' ? "checkmark-circle-outline" : "close-circle-outline"}
              size={SCREEN_WIDTH * 0.12}
              color="#fff"
              style={{ marginBottom: SCREEN_HEIGHT * 0.015 }}
            />
            <Text style={styles.messageModalText}>{messageText}</Text>

            <TouchableOpacity style={styles.messageModalButton} onPress={() => setMessageModalVisible(false)}>
              <Text style={styles.messageModalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.09,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.06,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.06,
  },
  avatar: {
    backgroundColor: '#f44336',
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_WIDTH * 0.18,
    borderRadius: (SCREEN_WIDTH * 0.18) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.05,
  },
  avatarText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.1,
    fontWeight: 'bold',
  },
  username: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
  },
  infoSection: {
    marginBottom: SCREEN_HEIGHT * 0.045,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.02,
    color: '#222',
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.045,
    marginBottom: SCREEN_HEIGHT * 0.01,
    color: '#555',
  },
  optionsSection: {
    marginBottom: SCREEN_HEIGHT * 0.035,
  },
  optionButton: {
    paddingVertical: SCREEN_HEIGHT * 0.018,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#444',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  footer: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.04,
  },
  versionText: {
    color: 'gray',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.05,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: SCREEN_WIDTH * 0.01,
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.015,
    color: '#222',
  },
  modalDescription: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#555',
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  sendButton: {
    marginTop: SCREEN_HEIGHT * 0.02,
    backgroundColor: '#f44336',
    paddingVertical: SCREEN_HEIGHT * 0.018,
    borderRadius: 25,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.05,
  },
  messageModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  messageModalContainer: {
    padding: SCREEN_WIDTH * 0.06,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  successBackground: {
    backgroundColor: '#4caf50',
  },
  errorBackground: {
    backgroundColor: '#f44336',
  },
  messageModalText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  messageModalButton: {
    backgroundColor: '#fff',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    borderRadius: 20,
  },
  messageModalButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.045,
  },
});
