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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [tempSelectedAvatarIndex, setTempSelectedAvatarIndex] = useState(null);

  const avatarOptions = [
    require('../../assets/avatars/avatar1.png'),
    require('../../assets/avatars/avatar2.png'),
    require('../../assets/avatars/avatar3.png'),
    require('../../assets/avatars/avatar4.png'),
  ];

  const auth = getAuth();
  const user = auth?.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');

          if (typeof data.avatarIndex === 'number' && avatarOptions[data.avatarIndex]) {
            setSelectedAvatar(avatarOptions[data.avatarIndex]);
            setSelectedAvatarIndex(data.avatarIndex);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  const saveAvatarToFirestore = async (index) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { avatarIndex: index },
        { merge: true }
      );
      showMessage('Profil resmi başarıyla güncellendi.', 'success');
    } catch (error) {
      showMessage('Profil resmi güncellenirken hata oluştu: ' + error.message, 'error');
    }
  };

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('rememberedUser');
    auth.signOut()
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      })
      .catch((error) => {
        showMessage('Çıkış yaparken hata oluştu: ' + error.message, 'error');
      });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Profil</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            setIsAvatarModalVisible(true);
            setTempSelectedAvatarIndex(selectedAvatarIndex);
          }}
          activeOpacity={0.7}
        >
          {selectedAvatar ? (
            <Image source={selectedAvatar} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(username && username.charAt(0).toUpperCase()) ||
                  (user?.email && user.email.charAt(0).toUpperCase()) ||
                  'U'}
              </Text>
            </View>
          )}
          <Text style={styles.avatarHintText}>Profil resmine dokunarak değiştirebilirsiniz</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>E-posta: {user?.email || 'Bulunamadı'}</Text>
          <Text style={styles.infoText}>Kullanıcı Adı: {username || 'Bulunamadı'}</Text>
          <Text style={styles.infoText}>Üyelik Tipi: Standart</Text>
        </View>

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

        <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('KitapEkle')}>
          <Text style={styles.optionText}>Kitap Önerisi Gönder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>


        <View>
          <Text style={[styles.optionText, { color: '#444', textAlign: 'center', fontSize: SCREEN_WIDTH * 0.035, paddingTop:20, }]}>Versiyon: 1.0.2</Text>
        </View>

      </ScrollView>

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
              <TouchableOpacity style={styles.resetButton} onPress={handleSendResetEmail} activeOpacity={0.7}>
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

      {/* Avatar Seçim Modalı */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Profil Resmini Seç</Text>
            <Text style={styles.modalDescription}>
              Profil resminizi değiştirmek için aşağıdan bir avatar seçin ve "Kaydet"e dokunun.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.avatarOptionsScroll}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              {avatarOptions.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setTempSelectedAvatarIndex(index)}
                  style={[
                    styles.avatarOption,
                    tempSelectedAvatarIndex === index && styles.avatarSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Image source={img} style={styles.avatarImageSmall} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setIsAvatarModalVisible(false)}
                style={[styles.sendButton, styles.cancelButton]}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (tempSelectedAvatarIndex !== null) {
                    setSelectedAvatar(avatarOptions[tempSelectedAvatarIndex]);
                    setSelectedAvatarIndex(tempSelectedAvatarIndex);
                    setIsAvatarModalVisible(false);
                    await saveAvatarToFirestore(tempSelectedAvatarIndex);
                  }
                }}
                disabled={tempSelectedAvatarIndex === null}
                style={[
                  styles.sendButton,
                  { opacity: tempSelectedAvatarIndex !== null ? 1 : 0.6 },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
    color: '#222',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: '#f44336',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  avatarHintText: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  optionButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 18,
    color: '#444',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // dilersen genişliği ayarla
    alignSelf: 'center', // İşte burası yatay ortalama için
    width: '50%',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  messageModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  messageModalContainer: {
    padding: 24,
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
    marginBottom: 16,
  },
  messageModalButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  messageModalButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarOptionsScroll: {
    marginVertical: 16,
  },
  avatarOption: {
    marginHorizontal: 9,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 3,
  },
  avatarSelected: {
    borderColor: '#f44336',
  },
  avatarImageSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  sendButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
});
