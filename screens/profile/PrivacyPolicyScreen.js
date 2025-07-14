import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Geri Tuşu ve Başlık */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Gizlilik Politikası</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Giriş</Text>
        <Text style={styles.text}>
          Bu gizlilik politikası, uygulamamız aracılığıyla topladığımız bilgilerin nasıl kullanıldığını ve korunduğunu açıklar. 
          Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.
        </Text>

        <Text style={styles.sectionTitle}>2. Toplanan Bilgiler</Text>
        <Text style={styles.text}>
          Uygulama, kullanıcı adı, e-posta adresi ve favori içerikler gibi sınırlı kişisel verileri toplar.
          Bu bilgiler yalnızca kullanıcı deneyimini geliştirmek amacıyla kullanılır.
        </Text>

        <Text style={styles.sectionTitle}>3. Bilgi Kullanımı</Text>
        <Text style={styles.text}>
          Toplanan bilgiler; hesap yönetimi, içerik önerileri, uygulama geliştirme ve destek hizmetleri amacıyla kullanılır. 
          Üçüncü taraflarla paylaşılmaz.
        </Text>

        <Text style={styles.sectionTitle}>4. Veri Güvenliği</Text>
        <Text style={styles.text}>
          Kullanıcı bilgilerinin güvenliği bizim için önceliklidir. Veriler güvenli sunucularda saklanmakta ve Firebase Authentication kullanılarak korunmaktadır.
        </Text>

        <Text style={styles.sectionTitle}>5. Üçüncü Taraf Hizmetleri</Text>
        <Text style={styles.text}>
          Uygulama, kimlik doğrulama ve veritabanı işlemleri için yalnızca Firebase hizmetlerini kullanmaktadır. 
          Bu hizmetlerin gizlilik politikaları ayrıca geçerlidir.
        </Text>

        <Text style={styles.sectionTitle}>6. Çerezler</Text>
        <Text style={styles.text}>
          Uygulama mobil platformda çalıştığı için çerez kullanımı bulunmamaktadır. 
          Ancak, Firebase gibi hizmet sağlayıcıların kendi analiz sistemleri olabilir.
        </Text>

        <Text style={styles.sectionTitle}>7. Kullanıcı Hakları</Text>
        <Text style={styles.text}>
          Kullanıcılar, kendileriyle ilgili bilgileri inceleme, düzeltme veya silme hakkına sahiptir. 
          Bu talepler için bizimle uygulama içinden veya destek e-postası üzerinden iletişime geçebilirsiniz.
        </Text>

        <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
        <Text style={styles.text}>
          Bu gizlilik politikası zamanla güncellenebilir. Güncellemeler uygulama içinde duyurulacaktır.
        </Text>

        <Text style={styles.sectionTitle}>9. İletişim</Text>
        <Text style={styles.text}>
          Sorularınız veya talepleriniz için: destek@uygulama.com adresinden bize ulaşabilirsiniz.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
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
});
