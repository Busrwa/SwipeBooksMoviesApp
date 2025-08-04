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

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info.swipeitofficial@gmail.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Gizlilik Politikası</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>1. Giriş</Text>
          <Text style={styles.text}>
            Bu gizlilik politikası, SwipeIt uygulaması aracılığıyla toplanan bilgilerin
            nasıl kullanıldığı, korunduğu ve işlendiğini açıklar. Uygulamayı kullanarak,
            bu politikayı kabul etmiş sayılırsınız.
          </Text>

          <Text style={styles.sectionTitle}>2. Toplanan Bilgiler</Text>
          <Text style={styles.text}>
            Kullanıcı adı, e-posta adresi, favoriler ve kullanım verileri gibi sınırlı
            kişisel bilgiler toplanabilir. Bu veriler, kullanıcı deneyimini geliştirmek
            amacıyla kullanılır ve üçüncü taraflarla paylaşılmaz.
          </Text>

          <Text style={styles.sectionTitle}>3. Bilgi Kullanımı</Text>
          <Text style={styles.text}>
            Toplanan bilgiler hesap yönetimi, içerik önerileri, uygulama geliştirme ve
            destek hizmetleri amacıyla kullanılır. Veriler, yasal zorunluluklar haricinde
            üçüncü kişilerle paylaşılmaz.
          </Text>

          <Text style={styles.sectionTitle}>4. Veri Güvenliği</Text>
          <Text style={styles.text}>
            Kullanıcı bilgileriniz, uygun teknik ve idari önlemlerle korunmaktadır.
            Firebase Authentication ve Firestore gibi güvenilir servisler kullanılmaktadır.
          </Text>

          <Text style={styles.sectionTitle}>5. Üçüncü Taraf Hizmetleri</Text>
          <Text style={styles.text}>
            Uygulama kimlik doğrulama ve veri depolama işlemleri için Firebase hizmetlerini
            kullanır. Bu hizmetlerin kendi gizlilik politikaları da geçerlidir.
          </Text>

          <Text style={styles.sectionTitle}>6. Çerezler</Text>
          <Text style={styles.text}>
            Mobil uygulamada çerez kullanılmaz. Ancak, üçüncü taraf servislerin analiz
            araçları olabilir.
          </Text>

          <Text style={styles.sectionTitle}>7. Kullanıcı Hakları</Text>
          <Text style={styles.text}>
            Kişisel verilerinizin erişimi, düzeltilmesi, silinmesi veya işlenmesine itiraz
            hakkınız vardır. Taleplerinizi uygulama içinden veya aşağıdaki e-posta adresinden iletebilirsiniz.
          </Text>

          <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
          <Text style={styles.text}>
            Gizlilik politikası zamanla güncellenebilir. Güncellemeler uygulama içinde
            duyurulacaktır.
          </Text>

          <Text style={styles.sectionTitle}>
            Uygulamaya kayıt olarak, kişisel verilerinizin bu gizlilik politikası kapsamında
            işleneceğini ve saklanacağını açıkça kabul etmiş olursunuz.
          </Text>

          <Text style={styles.sectionTitle}>9. İletişim</Text>
          <Text style={styles.text}>
            Sorularınız ve talepleriniz için:{' '}
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
    paddingTop: 20,      // sabit üst boşluk
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    width: 360,          // Sabit genişlik tüm cihazlarda aynı görünüm için
    alignSelf: 'center', // ortalamak için
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,    // sabit margin
  },
  backButton: {
    marginRight: 12,
    padding: 6,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    lineHeight: 32,
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 28,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  emailLink: {
    color: 'red',
    textDecorationLine: 'underline',
  },
});
