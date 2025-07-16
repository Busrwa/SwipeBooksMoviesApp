import React, { useContext, useState } from 'react';
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

export default function FavoriteScreen() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Silme modalını aç
  const openConfirmModal = (item) => {
    setItemToDelete(item);
    setConfirmModalVisible(true);
  };

  // Silme onayla
  const confirmDelete = () => {
    if (itemToDelete) {
      removeFavorite(itemToDelete);
    }
    setConfirmModalVisible(false);
    setItemToDelete(null);
  };

  // Kitap açıklama modalını aç
  const openBookModal = (item) => {
    setSelectedBook(item);
    setBookModalVisible(true);
  };

  // Kitap açıklama modalını kapat
  const closeBookModal = () => {
    setSelectedBook(null);
    setBookModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const coverSource = item.coverImageUrl ? { uri: item.coverImageUrl } : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openBookModal(item)} // Kart tıklanınca açıklama modalı açılır
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
            e.stopPropagation(); // Kart tıklamasını engelle
            openConfirmModal(item);
          }}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={SCREEN_WIDTH * 0.06} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favori Kitaplar</Text>

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
        />
      )}

      {/* Kitap Açıklama Modalı */}
      <Modal
        visible={bookModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBookModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={closeBookModal}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={SCREEN_WIDTH * 0.08} color="black" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT * 0.03 }}>
              <Text style={styles.modalTitle}>{selectedBook?.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {selectedBook?.author}</Text>
              <Text style={styles.modalDescription}>
                {selectedBook?.description || 'Açıklama bulunamadı.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Silme Onay Modalı */}
      <Modal
        visible={confirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setConfirmModalVisible(false)}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={SCREEN_WIDTH * 0.08} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Kitabı Silmek İstiyor musun?</Text>
            <Text style={styles.modalDescription}>
              Bu kitap favorilerinden kalıcı olarak kaldırılacak.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={confirmDelete} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Sil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    padding: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
  },
  cover: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_HEIGHT * 0.16,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#999',
  },
  info: {
    flex: 1,
    marginLeft: SCREEN_WIDTH * 0.04,
    justifyContent: 'center',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '600',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  author: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: 'gray',
  },
  deleteButton: {
    padding: SCREEN_WIDTH * 0.015,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: 'gray',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    padding: SCREEN_WIDTH * 0.05,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  modalAuthor: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: 'gray',
    marginBottom: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: SCREEN_WIDTH * 0.045,
    lineHeight: SCREEN_WIDTH * 0.06,
    textAlign: 'justify',
    color: 'gray',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SCREEN_HEIGHT * 0.03,
  },
  confirmButton: {
    backgroundColor: 'red',
    paddingHorizontal: SCREEN_WIDTH * 0.07,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.045,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: SCREEN_WIDTH * 0.07,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.045,
  },
});
