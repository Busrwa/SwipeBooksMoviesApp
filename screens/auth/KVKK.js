import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Expo kullanıyorsan bu, yoksa başka icon paketi kullanabilirsin

export default function KVKK({ navigation }) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</Text>
          {/* Sağ tarafta boş yer, başlığı ortalamak için */}
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 30 }}>
          <Text style={styles.paragraph}>
            İşbu metin, Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat uyarınca,
            SwipeIt uygulaması kullanıcılarının kişisel verilerinin işlenme süreçleri hakkında
            bilgilendirme yapmak amacıyla hazırlanmıştır.
          </Text>

          <Text style={styles.heading}>1. Veri Sorumlusu</Text>
          <Text style={styles.paragraph}>
            Veri sorumlusu, SwipeIt uygulamasını işleten şirket/tüzel kişi olup, kullanıcıların
            kişisel verilerini kanun ve sözleşmeler çerçevesinde korumayı taahhüt eder.
          </Text>

          <Text style={styles.heading}>2. İşlenen Kişisel Veriler</Text>
          <Text style={styles.paragraph}>
            Ad, soyad, e-posta, kullanıcı adı, şifre, IP adresi, kullanım verileri gibi
            kişisel verileriniz işlenebilir.
          </Text>

          <Text style={styles.heading}>3. Kişisel Verilerin İşlenme Amaçları</Text>
          <Text style={styles.paragraph}>
            Hizmetlerin sunulması, hesap yönetimi, müşteri desteği, uygulama geliştirme, 
            yasal yükümlülüklerin yerine getirilmesi amaçlarıyla verileriniz işlenir.
          </Text>

          <Text style={styles.heading}>4. Kişisel Verilerin Aktarılması</Text>
          <Text style={styles.paragraph}>
            Kişisel verileriniz, ilgili yasal düzenlemeler çerçevesinde ve açık rızanız alınmadıkça
            üçüncü kişilere aktarılmaz.
          </Text>

          <Text style={styles.heading}>5. Veri Sahibi Hakları</Text>
          <Text style={styles.paragraph}>
            KVKK’nın 11. maddesi kapsamında; kişisel verilerinize erişim, düzeltme, silme,
            işleme itiraz etme ve veri taşınabilirliği gibi haklara sahipsiniz.
          </Text>

          <Text style={styles.heading}>6. İletişim</Text>
          <Text style={styles.paragraph}>
            Kişisel verilerinizle ilgili talepleriniz için bizimle
            info.swipeitofficial@gmail.com adresinden iletişime geçebilirsiniz.
          </Text>

          <Text style={styles.consent}>
            Yukarıda belirtilen kişisel verilerimin SwipeIt uygulaması tarafından işlenmesini
            ve KVKK kapsamında haklarımın bana bildirildiğini okudum, anladım ve kabul ediyorum.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 50,
    backgroundColor: 'white',
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    flex: 1,
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  scrollView: { 
    flex: 1 
  },
  heading: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 15, 
    marginBottom: 5 
  },
  paragraph: { 
    fontSize: 14, 
    lineHeight: 20, 
    color: '#444' 
  },
  consent: {
    fontSize: 14,
    marginTop: 25,
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
