import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsOfUseScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info.swipeitofficial@gmail.com');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Geri Tuşu ve Başlık */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Kullanım Koşulları</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>1. Kabul</Text>
          <Text style={styles.text}>
            Bu uygulamayı kullanarak, aşağıda belirtilen tüm şart ve koşulları kabul etmiş sayılırsınız.
            Eğer bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
          </Text>

          <Text style={styles.sectionTitle}>2. Hizmet Tanımı</Text>
          <Text style={styles.text}>
            Bu uygulama, kullanıcıların kitap ve film içeriklerini incelemesine, favorilerine eklemesine ve kaydetmesine olanak tanır.
          </Text>

          <Text style={styles.sectionTitle}>3. Hesap Güvenliği</Text>
          <Text style={styles.text}>
            Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi gizli tutmalı, şüpheli durumları bildirmeniz gereklidir.
          </Text>

          <Text style={styles.sectionTitle}>4. Kullanıcı Sorumlulukları</Text>
          <Text style={styles.text}>
            Uygulamada yasa dışı, zararlı, yanıltıcı içerik paylaşımı yasaktır. Bu tür davranışlar hesabınızın askıya alınmasına neden olabilir.
          </Text>

          <Text style={styles.sectionTitle}>5. Fikri Mülkiyet</Text>
          <Text style={styles.text}>
            Tüm içerik, tasarım ve yazılım geliştiriciye aittir ve izinsiz kullanılamaz.
          </Text>

          <Text style={styles.sectionTitle}>6. Sorumluluğun Sınırlandırılması</Text>
          <Text style={styles.text}>
            Uygulama hatasız veya kesintisiz çalışacağına dair garanti vermez. Doğabilecek zararlardan geliştirici sorumlu tutulamaz.
          </Text>

          <Text style={styles.sectionTitle}>7. Değişiklikler</Text>
          <Text style={styles.text}>
            Koşullar zamanla güncellenebilir. Güncellenen koşullar uygulama üzerinden duyurulacaktır.
          </Text>

          <Text style={styles.sectionTitle}>8. Yürürlük</Text>
          <Text style={styles.text}>
            Bu koşullar 1 Temmuz 2025 itibariyle geçerlidir.
          </Text>

          <Text style={styles.sectionTitle}>9. İletişim</Text>
          <Text style={styles.text}>
            Sorularınız veya talepleriniz için:{' '}
            <Text style={styles.emailLink} onPress={handleEmailPress}>
              info.swipeitofficial@gmail.com
            </Text>
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
    // paddingTop dinamik insets.top ile veriliyor
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  emailLink: {
    color: 'red',
    textDecorationLine: 'underline',
  },
});
