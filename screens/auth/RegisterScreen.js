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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

function CheckBox({ value, onValueChange }) {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={styles.checkboxContainer}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel="KVKK Onayı"
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [kvkkAccepted, setKvkkAccepted] = useState(false);


  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // Form Validasyon fonksiyonu
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]+$/; // sadece harf ve rakam
    const passwordRegex = /^[a-zA-Z0-9]+$/; // sadece harf ve rakam

    if (!username.trim()) {
      showModal('Hata', 'Kullanıcı adı boş bırakılamaz.');
      return false;
    }
    if (username.length < 3) {
      showModal('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır.');
      return false;
    }
    if (!usernameRegex.test(username.trim())) {
      showModal('Hata', 'Kullanıcı adı sadece harf ve rakamlardan oluşmalıdır. Özel karakter içeremez.');
      return false;
    }
    if (!email.trim()) {
      showModal('Hata', 'Email boş bırakılamaz.');
      return false;
    }
    if (!emailRegex.test(email)) {
      showModal('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }
    if (!password) {
      showModal('Hata', 'Şifre boş bırakılamaz.');
      return false;
    }
    if (password.length < 6) {
      showModal('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    if (!confirmPassword) {
      showModal('Hata', 'Şifre tekrar boş bırakılamaz.');
      return false;
    }
    if (!passwordRegex.test(password)) {
      showModal('Hata', 'Şifre sadece harf ve rakamlardan oluşmalıdır. Özel karakter içeremez.');
      return false;
    }

    if (password !== confirmPassword) {
      showModal('Hata', 'Şifreler uyuşmuyor.');
      return false;
    }
    if (!kvkkAccepted) {
      showModal('KVKK Onayı Gerekli', 'Devam etmek için KVKK metnini okuyup onaylamanız gerekmektedir.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showModal('Hata', 'Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username.trim(),
        createdAt: new Date(),
      });

      showModal('Başarılı', 'Kayıt işlemi tamamlandı. Giriş yapabilirsiniz.');
      setLoading(false);
    } catch (error) {
      console.error(error);
      let message = 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Bu eposta zaten kayıtlı.';
      } else if (error.code === 'auth/invalid-eposta') {
        message = 'Geçersiz eposta adresi.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'İnternet bağlantınızı kontrol edin.';
      }
      showModal('Kayıt Hatası', message);
      setLoading(false);
    }
  };

  const openKVKK = () => {
    navigation.navigate('KVKK');
  };

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <Image source={require('../../assets/swipeitlogo.png')} style={styles.logo} />

            <Text style={styles.title}>Kayıt Ol</Text>

            <TextInput
              style={[styles.input, { color: 'black' }]}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              accessibilityLabel="Kullanıcı Adı"
              returnKeyType="next"
            />

            <TextInput
              style={[styles.input, { color: 'black' }]}
              placeholder="E-posta"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              textContentType="emailAddress"
              accessibilityLabel="Email"
              returnKeyType="next"
            />

            <View style={[styles.passwordContainer]}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: 'black' }]}
                placeholder="Şifre"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoComplete="password-new"
                accessibilityLabel="Şifre"
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Text style={{ fontSize: 20 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: 'black' }]}
                placeholder="Şifre Tekrar"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="password-new"
                accessibilityLabel="Şifre Tekrar"
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Text style={{ fontSize: 20 }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.kvkkContainer}>
              <CheckBox value={kvkkAccepted} onValueChange={setKvkkAccepted} />
              <Text style={styles.kvkkText}>
                Bu uygulamaya kayıt olarak, yukarıda belirtilen tüm koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
                {' '}
                <Text style={styles.kvkkLink} onPress={openKVKK} accessibilityRole="link">
                  (Detaylar)
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Kayıt Ol"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Giriş Yap"
              style={{ marginTop: 10 }}
            >
              <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Tamam"
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
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  innerContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,  // bu boşluk çok büyük, burayı küçült
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 13 : 12,
  },
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E63946',
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
    backgroundColor: '#E63946',
    borderRadius: 3,
  },
  kvkkText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  kvkkLink: {
    color: '#E63946',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: 'gray',
    fontSize: 14,
    textDecorationLine: 'underline',
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
    backgroundColor: '#E63946',
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
