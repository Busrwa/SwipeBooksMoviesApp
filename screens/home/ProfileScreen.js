import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';

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
            >
              <Ionicons name="close" size={28} color="#333" />
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
              size={48}
              color="#fff"
              style={{ marginBottom: 10 }}
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
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    backgroundColor: '#f44336',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#444',
  },
  logoutButton: {
    borderBottomWidth: 0,
    
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  versionText: {
    color: 'gray',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  sendButton: {
    marginTop: 15,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  messageModalContainer: {
    padding: 25,
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
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  messageModalButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  messageModalButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
