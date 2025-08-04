import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const supportEmail = 'info.swipeitofficial@gmail.com';

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', showButton: false });

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`).catch(() => {
      setModalContent({
        title: 'Hata',
        message: 'E-posta uygulaması açılamadı. Lütfen manuel olarak mail gönderin.',
        showButton: false,
      });
      setModalVisible(true);
    });
  };

  const handleFeedbackPress = () => {
    setModalContent({
      title: 'Geri Bildirim',
      message: 'Geri bildiriminizi bizimle paylaşmak için lütfen e-posta gönderin.',
      showButton: true,
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Yardım & Destek</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SSS */}
          <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>

          <View style={styles.faqBlock}>
            <Text style={styles.question}>• Uygulamaya nasıl kayıt olabilirim?</Text>
            <Text style={styles.answer}>Ana ekrandaki "Kayıt Ol" butonuna tıklayarak bilgilerinizi girmeniz yeterlidir.</Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={styles.question}>• Şifremi unuttum ne yapmalıyım?</Text>
            <Text style={styles.answer}>Profil sayfanızdan "Şifre Değiştir" seçeneğiyle sıfırlama e-postası alabilirsiniz.</Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={styles.question}>• KVKK veya Gizlilik Politikası metnine nereden ulaşabilirim?</Text>
            <Text style={styles.answer}>Profil ekranındaki "Gizlilik Politikası" ve "Kullanım Koşulları" bağlantılarını kullanabilirsiniz.</Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={styles.question}>• Uygulamada bir hata buldum, nasıl bildirebilirim?</Text>
            <Text style={styles.answer}>Aşağıdaki "Sorun Bildir" seçeneğinden bize ulaşabilirsiniz.</Text>
          </View>

          {/* İletişim */}
          <Text style={styles.sectionTitle}>İletişim</Text>
          <Text style={styles.text}>
            Her türlü soru, öneri veya teknik destek için bizimle iletişime geçebilirsiniz:
          </Text>

          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.emailLink}>{supportEmail}</Text>
          </TouchableOpacity>

          {/* Geri Bildirim */}
          <TouchableOpacity onPress={handleFeedbackPress} style={styles.feedbackButton}>
            <Ionicons name="bug-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.feedbackButtonText}>Sorun Bildir / Geri Bildirim Gönder</Text>
          </TouchableOpacity>

          <Text style={styles.noteText}>
            Geri bildirimleriniz uygulamayı geliştirmemize yardımcı olur. Teşekkür ederiz!
          </Text>
        </ScrollView>
      </View>

      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <View style={styles.modalButtons}>
              {modalContent.showButton && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    handleEmailPress();
                  }}
                >
                  <Text style={styles.modalButtonText}>E-posta Gönder</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    width: 360,
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  content: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginVertical: 16,
  },
  faqBlock: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
  },
  answer: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginBottom: 14,
  },
  emailLink: {
    fontSize: 16,
    color: '#e53935',
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 14,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginTop: 14,
    fontStyle: 'italic',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e53935',
    marginBottom: 14,
  },
  modalMessage: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 26,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 14,
  },
  modalButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
