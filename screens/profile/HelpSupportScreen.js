import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // Çentiğe göre üst-alt boşluk değerleri
  const supportEmail = 'info.swipeitofficial@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`).catch(() =>
      Alert.alert(
        'Hata',
        'E-posta uygulaması açılamadı. Lütfen manuel olarak mail gönderin.'
      )
    );
  };

  const handleFeedbackPress = () => {
    Alert.alert(
      'Geri Bildirim',
      'Geri bildiriminizi bizimle paylaşmak için lütfen e-posta gönderin.',
      [{ text: 'Tamam', onPress: handleEmailPress }]
    );
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

          {/* Geri Bildirim / Sorun Bildir */}
          <TouchableOpacity onPress={handleFeedbackPress} style={styles.feedbackButton}>
            <Ionicons name="bug-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.feedbackButtonText}>Sorun Bildir / Geri Bildirim Gönder</Text>
          </TouchableOpacity>

          <Text style={styles.noteText}>
            Geri bildirimleriniz uygulamayı geliştirmemize yardımcı olur. Teşekkür ederiz!
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop dinamik olarak insets.top ile ayarlanıyor
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // paddingTop kaldırıldı, artık SafeAreaView üst boşluk sağlıyor
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginVertical: 16,
  },
  faqBlock: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  answer: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
  },
  emailLink: {
    fontSize: 16,
    color: '#e53935',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
