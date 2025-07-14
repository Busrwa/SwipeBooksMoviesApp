import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, Modal
} from 'react-native';
import { FavoritesContext } from '../../context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';

export default function FavoriteScreen() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const openConfirmModal = (item) => {
    setItemToDelete(item);
    setConfirmModalVisible(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFavorite(itemToDelete);
    }
    setConfirmModalVisible(false);
    setItemToDelete(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.coverId ? (
        <Image
          source={{ uri: `https://covers.openlibrary.org/b/id/${item.coverId}-M.jpg` }}
          style={styles.cover}
          resizeMode="cover"
        />
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
        onPress={() => openConfirmModal(item)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

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
          keyExtractor={(item, index) => item.title + index}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

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
            >
              <Ionicons name="close" size={30} color="black" />
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: 12,
    color: '#999',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: 'gray',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },

  /** ✅ Modal Styles (SwipeScreen modalına benziyor) */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confirmButton: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
