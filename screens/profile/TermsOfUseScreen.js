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

export default function TermsOfUseScreen() {
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
          <Text style={styles.header}>Kullanım Koşulları</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>1. Tanımlar</Text>
          <Text style={styles.text}>
            İşbu Kullanım Koşulları metninde;
            {"\n"}- “Uygulama” ifadesi SwipeIt mobil uygulamasını,
            {"\n"}- “Kullanıcı” ifadesi uygulamayı kullanan gerçek veya tüzel kişiyi,
            {"\n"}- “Biz”, “SwipeIt” ifadesi ise uygulamanın sahibi ve işletmecisini ifade eder.
          </Text>

          <Text style={styles.sectionTitle}>2. Kabul ve Onay</Text>
          <Text style={styles.text}>
            Uygulamayı indirip kullanmanızla, işbu Kullanım Koşulları’nı, Gizlilik Politikası ve KVKK aydınlatma metnini okuyup anladığınızı,
            tamamını kabul ettiğinizi beyan etmiş sayılırsınız. Eğer bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
            Kullanımınız devam ettiği sürece bu koşulları kabul ettiğiniz varsayılır.
          </Text>

          <Text style={styles.sectionTitle}>3. Hizmet Tanımı</Text>
          <Text style={styles.text}>
            SwipeIt, kullanıcıların kitap ve film içeriklerini görüntülemesine, favorilere eklemesine, değerlendirmesine ve kişisel koleksiyonlarını yönetmesine imkan tanır.
            Hizmet kapsamında sunulan içerik ve işlevler önceden haber verilmeksizin değiştirilebilir veya sonlandırılabilir.
          </Text>

          <Text style={styles.sectionTitle}>4. Hesap ve Güvenlik</Text>
          <Text style={styles.text}>
            Hesabınızın güvenliği sizin sorumluluğunuzdadır. Şifrenizi gizli tutmanız, yetkisiz erişim durumunda derhal bizimle iletişime geçmeniz gerekmektedir.
            Herhangi bir yetkisiz kullanımda SwipeIt’in sorumluluğu bulunmamaktadır.
          </Text>

          <Text style={styles.sectionTitle}>5. Kullanıcı Yükümlülükleri</Text>
          <Text style={styles.text}>
            Uygulamada;
            {"\n"}- Kanunlara, genel ahlak ve adaba aykırı,
            {"\n"}- Telif hakkı veya diğer üçüncü şahıs haklarını ihlal eden,
            {"\n"}- Zararlı, yanıltıcı, tehditkar, hakaret içeren içeriklerin paylaşımı kesinlikle yasaktır.
            Bu tür davranışlar tespit edilmesi halinde hesabınız askıya alınabilir, silinebilir ve yasal işlem başlatılabilir.
            Kullanıcı olarak, paylaştığınız tüm içeriklerin hukuki sorumluluğu tamamen size aittir.
          </Text>

          <Text style={styles.sectionTitle}>6. Fikri Mülkiyet Hakları</Text>
          <Text style={styles.text}>
            Uygulamaya ait tüm yazılım, tasarım, içerik, logo, marka ve benzeri fikri mülkiyet hakları SwipeIt veya lisans verenlerine aittir.
            İzinsiz kopyalanması, dağıtılması veya ticari amaçlarla kullanılması yasaktır.
          </Text>

          <Text style={styles.sectionTitle}>7. Üçüncü Taraf Hizmetler</Text>
          <Text style={styles.text}>
            Uygulamada, kimlik doğrulama ve veri saklama gibi işlemler için Firebase gibi üçüncü taraf servisler kullanılmaktadır.
            Bu servislerin kendi gizlilik politikaları ve kullanım koşulları geçerlidir.
          </Text>

          <Text style={styles.sectionTitle}>8. Sorumluluğun Sınırlandırılması</Text>
          <Text style={styles.text}>
            Uygulama “olduğu gibi” ve “mevcut durumda” sunulmaktadır. Kesintisiz, hatasız veya kesintisiz çalışacağına dair garanti verilmez.
            SwipeIt, uygulamanın kullanımından doğan doğrudan veya dolaylı zararlardan, veri kaybından veya üçüncü tarafların davranışlarından sorumlu tutulamaz.
            Ayrıca kullanıcıların paylaştığı içeriklerin doğruluğu veya yasallığı konusunda garanti vermez.
          </Text>

          <Text style={styles.sectionTitle}>9. Kişisel Verilerin Korunması</Text>
          <Text style={styles.text}>
            Kişisel verilerinizin işlenmesine ilişkin detaylı bilgiler için lütfen Gizlilik Politikası ve KVKK Aydınlatma Metni’ni inceleyiniz.
            Kullanıcı onayı olmadan kişisel verileriniz üçüncü taraflarla paylaşılmaz.
          </Text>

          <Text style={styles.sectionTitle}>10. Değişiklikler</Text>
          <Text style={styles.text}>
            SwipeIt, işbu Kullanım Koşullarını herhangi bir zamanda önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar.
            Yapılan değişiklikler uygulama üzerinden duyurulacak ve kullanıcıların erişimine sunulacaktır.
            Kullanımınıza devam etmeniz güncellenen koşulları kabul ettiğiniz anlamına gelir.
          </Text>

          <Text style={styles.sectionTitle}>11. Uyuşmazlıkların Çözümü</Text>
          <Text style={styles.text}>
            İşbu Kullanım Koşullarından doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanacak olup,
            İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.
          </Text>

          <Text style={styles.sectionTitle}>12. İletişim</Text>
          <Text style={styles.text}>
            İşbu koşullar, hizmetlerimiz veya kişisel verilerinizle ilgili sorularınız için aşağıdaki e-posta adresinden bizimle iletişime geçebilirsiniz:{' '}
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
    paddingTop: 20,       // Sabit üst boşluk
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,  // Sabit yandan boşluk
    width: 360,             // Sabit genişlik, ortalamak için container dışına sarmak gerekebilir
    alignSelf: 'center',    // Ortalamak için
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,       // Sabit margin
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
