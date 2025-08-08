import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const savedEmail = await AsyncStorage.getItem('rememberedUser');
      if (user && savedEmail) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    });

    return () => unsubscribe(); // component unmount olduğunda temizle
  }, []);


  const showPopup = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showPopup('Eksik Bilgi', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Beni hatırla seçiliyse email kaydet, değilse sil
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedUser', email);
      } else {
        await AsyncStorage.removeItem('rememberedUser');
      }

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      let message = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      if (error.code === 'auth/invalid-email') message = 'Geçersiz e-posta adresi.';
      else if (error.code === 'auth/user-not-found') message = 'Kullanıcı bulunamadı.';
      else if (error.code === 'auth/wrong-password') message = 'Şifre yanlış.';
      showPopup('Giriş Hatası', message);
    }
  };


  const handleForgotPassword = async () => {
    if (!email) {
      showPopup('E-posta Gerekli', 'Şifre sıfırlama için lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showPopup('E-posta Gönderildi', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (error) {
      showPopup('Hata', 'Şifre sıfırlama sırasında bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <Image
              source={require('../../assets/swipeitlogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Giriş Yap</Text>

            <TextInput
              style={[styles.input, { color: 'black' }]}
              placeholder="E-posta"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: 'black' }]}
                placeholder="Şifre"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.forgotRememberContainer}>
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordTouchable}>
                <Text style={styles.forgotPassword}>Şifremi Unuttum?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.rememberMeContainer}
                activeOpacity={0.8}
              >
                <View style={[styles.customCheckbox, rememberMe && styles.customCheckboxChecked]} />
                <Text style={styles.rememberText}>Beni Hatırla</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Hesabın yok mu? Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6, // ekran genişliğinin yarısı kadar
    height: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
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
    marginBottom: 12,
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 15 : 15,
  },
  forgotRememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  forgotPasswordTouchable: {
    paddingVertical: 5,
  },
  forgotPassword: {
    color: '#E63946',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E63946',
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  customCheckboxChecked: {
    backgroundColor: '#E63946',
  },
  rememberText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
    paddingHorizontal: 30,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
