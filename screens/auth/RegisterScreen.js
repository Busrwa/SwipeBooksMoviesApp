import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Checkbox için basit bileşen
function CheckBox({ value, onValueChange }) {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={styles.checkboxContainer}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]} />
    </TouchableOpacity>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // KVKK onayı durumu
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      showModal('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      showModal('Hata', 'Şifreler uyuşmuyor.');
      return;
    }
    if (!kvkkAccepted) {
      showModal('KVKK Onayı Gerekli', 'Devam etmek için KVKK metnini okuyup onaylamanız gerekmektedir.');
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showModal('Hata', 'Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username,
        createdAt: new Date(),
      });

      showModal('Başarılı', 'Kayıt işlemi tamamlandı. Giriş yapabilirsiniz.');
      setLoading(false);
    } catch (error) {
      console.error(error);
      showModal('Kayıt Hatası', error.message);
      setLoading(false);
    }
  };

  // KVKK metni ekranına yönlendirme
  const openKVKK = () => {
    navigation.navigate('KVKK'); // KVKK sayfasını navigation'a eklediğini varsayıyorum
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/swipeitlogo.png')} style={styles.logo} />

      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre Tekrar"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.kvkkContainer}>
        <CheckBox value={kvkkAccepted} onValueChange={setKvkkAccepted} />
        <Text style={styles.kvkkText}>
          KVKK metnini okudum, kabul ediyorum.{' '}
          <Text style={styles.kvkkLink} onPress={openKVKK}>
            (Detaylar)
          </Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
      </TouchableOpacity>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                if (modalTitle === 'Başarılı') {
                  navigation.navigate('Login');
                }
              }}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
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
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
  },
  checkboxChecked: {
    backgroundColor: 'red',
    borderRadius: 3,
  },
  kvkkText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  kvkkLink: {
    color: 'red',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: 'gray',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
