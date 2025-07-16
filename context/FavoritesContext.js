import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase'; 
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const user = auth.currentUser;

  // Kullanıcının favorilerini Firestore'dan çek
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        } else {
          // Eğer kullanıcı yoksa Firestore’da boş favori listesi oluştur
          await setDoc(docRef, { favorites: [] });
          setFavorites([]);
        }
      } catch (error) {
        console.error('Favoriler alınırken hata:', error);
      }
    };

    fetchFavorites();
  }, [user]);

  // Kitap objesini temizle ve undefined/null değerleri engelle
  const cleanBook = (book) => ({
  title: book.title || 'Bilinmiyor',
  author: book.author || 'Bilinmiyor',
  coverImageUrl: book.coverImageUrl || null,  // Burayı değiştir
  description: book.description || '',
});


  // Favori ekle: hem state güncelle hem Firestore'a ekle
  const addFavorite = async (book) => {
  if (!user) return;

  const clean = cleanBook(book);

  setFavorites((prev) => {
    if (prev.some(item => item.title === clean.title && item.author === clean.author)) {
      return prev;
    }
    return [...prev, clean];
  });

  try {
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, {
      favorites: arrayUnion(clean),
    });
  } catch (error) {
    console.error('Favori eklenirken hata:', error);
  }
};


  // Favori çıkar: hem state güncelle hem Firestore'dan çıkar
  const removeFavorite = async (book) => {
    if (!user) return;

    const clean = cleanBook(book);

    setFavorites((prev) =>
      prev.filter(
        (item) => !(item.title === clean.title && item.author === clean.author)
      )
    );

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        favorites: arrayRemove(clean),
      });
    } catch (error) {
      console.error('Favori çıkarılırken hata:', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
