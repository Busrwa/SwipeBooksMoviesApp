import React, { useContext, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FavoritesContext } from '../../context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_FAVORITES = 15;

const FavoriteItem = memo(({ item, onPress, onDelete }) => {
  const coverSource = item.coverImageUrl ? { uri: item.coverImageUrl } : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {coverSource ? (
        <Image source={coverSource} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Text style={styles.noCoverText}>Kapak Yok</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={SCREEN_WIDTH * 0.06} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const CustomModal = ({ visible, onClose, title, children, buttons }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.modalCloseButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={SCREEN_WIDTH * 0.08} color="black" />
        </TouchableOpacity>
        {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
        <ScrollView
          contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT * 0.03 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {buttons && (
          <View style={styles.modalButtons}>
            {buttons.map(({ text, onPress, style, textStyle }, i) => (
              <TouchableOpacity key={i} onPress={onPress} style={[styles.modalButton, style]}>
                <Text style={[styles.modalButtonText, textStyle]}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  </Modal>
);

export default function FavoriteScreen({ navigation }) {
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const openBookModal = useCallback((item) => {
    setSelectedBook(item);
    setBookModalVisible(true);
  }, []);

  const closeBookModal = useCallback(() => {
    setSelectedBook(null);
    setBookModalVisible(false);
  }, []);

  const openConfirmModal = useCallback((item) => {
    setItemToDelete(item);
    setConfirmModalVisible(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      removeFavorite(itemToDelete);
    }
    setConfirmModalVisible(false);
    setItemToDelete(null);
  }, [itemToDelete, removeFavorite]);

  const tryAddFavorite = useCallback(
    (book) => {
      if (favorites.length >= MAX_FAVORITES) {
        setLimitModalVisible(true);
        return false;
      }
      addFavorite(book);
      return true;
    },
    [favorites.length, addFavorite]
  );

  const closeLimitModal = () => setLimitModalVisible(false);

  const renderItem = useCallback(
    ({ item }) => (
      <FavoriteItem
        item={item}
        onPress={openBookModal}
        onDelete={openConfirmModal}
      />
    ),
    [openBookModal, openConfirmModal]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kütüphanem</Text>

      {favorites.length >= MAX_FAVORITES && (
        <View style={styles.limitWarningContainer}>
          <Text style={styles.limitWarningText}>
            En fazla {MAX_FAVORITES} kitap favorilere eklenebilir.
          </Text>
        </View>
      )}

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz favori kitap eklenmedi.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => item.id?.toString() || item.title + index}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT * 0.04 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      )}

      <CustomModal
        visible={bookModalVisible}
        onClose={closeBookModal}
        title={selectedBook?.title}
        buttons={[{
          text: 'Yorumlar & Alıntılar',
          onPress: () => {
            setBookModalVisible(false);
            const safeBook = {
              ...selectedBook,
              createdAt: selectedBook.createdAt?.toDate ? selectedBook.createdAt.toDate().toISOString()
                : (selectedBook.createdAt instanceof Date ? selectedBook.createdAt.toISOString() : null),
            };
            navigation.navigate('DetailScreen', { book: safeBook });
          },
          style: styles.detailButton,
          textStyle: styles.detailButtonText,
        }]}
      >
        <Text style={styles.modalAuthor}>Yazar: {selectedBook?.author}</Text>
        {selectedBook?.coverImageUrl && (
          <Image
            source={{ uri: selectedBook.coverImageUrl }}
            style={styles.modalCover}
            resizeMode="cover"
          />
        )}
        <Text style={styles.modalDescription}>
          {selectedBook?.description || 'Açıklama bulunamadı.'}
        </Text>
      </CustomModal>

      <CustomModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title="Kitabı Silmek İstiyor musun?"
        buttons={[{
          text: 'Sil',
          onPress: confirmDelete,
          style: styles.confirmButton,
          textStyle: styles.confirmButtonText,
        }, {
          text: 'İptal',
          onPress: () => setConfirmModalVisible(false),
          style: styles.cancelButton,
          textStyle: styles.cancelButtonText,
        }]}
      >
        <Text style={styles.modalDescription}>
          Bu kitap favorilerinden kalıcı olarak kaldırılacak.
        </Text>
      </CustomModal>

      <CustomModal
        visible={limitModalVisible}
        onClose={closeLimitModal}
        title="Limit Aşıldı!"
        buttons={[{
          text: 'Tamam',
          onPress: closeLimitModal,
          style: styles.confirmButton,
          textStyle: styles.confirmButtonText,
        }]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color="red"
          style={{ alignSelf: 'center', marginBottom: 20 }}
        />
        <Text style={[styles.modalDescription, { textAlign: 'center' }]}>En fazla {MAX_FAVORITES} kitap favorilere eklenebilir.</Text>
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: SCREEN_HEIGHT * 0.06, paddingHorizontal: SCREEN_WIDTH * 0.05 },
  header: { fontSize: SCREEN_WIDTH * 0.07, fontWeight: 'bold', marginBottom: SCREEN_HEIGHT * 0.03, textAlign: 'center' },
  limitWarningContainer: { backgroundColor: '#ffe5e5', padding: SCREEN_HEIGHT * 0.015, borderRadius: 8, marginBottom: SCREEN_HEIGHT * 0.02, borderWidth: 1, borderColor: 'red' },
  limitWarningText: { color: 'red', fontSize: SCREEN_WIDTH * 0.04, textAlign: 'center', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, padding: SCREEN_WIDTH * 0.03, marginBottom: SCREEN_HEIGHT * 0.02, alignItems: 'center' },
  cover: { width: SCREEN_WIDTH * 0.18, height: SCREEN_HEIGHT * 0.16, borderRadius: 8, backgroundColor: '#ddd' },
  noCover: { justifyContent: 'center', alignItems: 'center' },
  noCoverText: { fontSize: SCREEN_WIDTH * 0.035, color: '#999' },
  info: { flex: 1, marginLeft: SCREEN_WIDTH * 0.04, justifyContent: 'center' },
  title: { fontSize: SCREEN_WIDTH * 0.05, fontWeight: '600', marginBottom: SCREEN_HEIGHT * 0.008 },
  author: { fontSize: SCREEN_WIDTH * 0.04, color: 'gray' },
  deleteButton: { padding: SCREEN_WIDTH * 0.015 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: SCREEN_WIDTH * 0.05, color: 'gray' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: SCREEN_WIDTH * 0.05 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxHeight: SCREEN_HEIGHT * 0.8, padding: SCREEN_WIDTH * 0.05 },
  modalCloseButton: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: SCREEN_WIDTH * 0.065, fontWeight: 'bold', marginBottom: SCREEN_HEIGHT * 0.02, textAlign: 'center' },
  modalAuthor: { fontSize: SCREEN_WIDTH * 0.05, color: 'gray', marginBottom: SCREEN_HEIGHT * 0.03, textAlign: 'center' },
  modalDescription: { fontSize: SCREEN_WIDTH * 0.045, lineHeight: SCREEN_WIDTH * 0.06, textAlign: 'justify', color: 'gray' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: SCREEN_HEIGHT * 0.03 },
  modalButton: { flex: 1, marginHorizontal: 5, paddingVertical: SCREEN_HEIGHT * 0.015, borderRadius: 20, backgroundColor: 'red', alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 },
  confirmButton: { backgroundColor: 'red' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 },
  cancelButton: { backgroundColor: '#ccc' },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 },
  detailButton: { backgroundColor: 'red' },
  detailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 },
});