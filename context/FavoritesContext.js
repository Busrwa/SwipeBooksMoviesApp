import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import NetInfo from "@react-native-community/netinfo";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
          setLikedBooks(Array.isArray(data.likedBooks) ? data.likedBooks : []);
        } else {
          await setDoc(docRef, { favorites: [], likedBooks: [] });
          setFavorites([]);
          setLikedBooks([]);
        }
      } catch (error) {
        console.error('Veriler alınırken hata:', error);
      }
    };

    fetchData();
  }, [user]);

  const cleanBook = (book) => ({
    title: book.title || 'Bilinmiyor',
    author: book.author || 'Bilinmiyor',
    coverImageUrl: book.coverImageUrl || null,
    description: book.description || '',
  });

  const addFavorite = async (book) => {
    if (!user) return;
    if (favorites.length >= 15) {
      console.warn('En fazla 15 favori kitap eklenebilir.');
      return;
    }

    const clean = cleanBook(book);
    
    // İnternet kontrolü
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      alert('İnternet bağlantısı yok. Favori eklenemiyor.');
      return;
    }

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


  const removeFavorite = async (book) => {
    if (!user) return;
    const clean = cleanBook(book);
    setFavorites((prev) => prev.filter(
      (item) => !(item.title === clean.title && item.author === clean.author)
    ));

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        favorites: arrayRemove(clean),
      });
    } catch (error) {
      console.error('Favori çıkarılırken hata:', error);
    }
  };

  const addLikedBook = async (book) => {
    if (!user) return;
    const clean = cleanBook(book);

    setLikedBooks((prev) => {
      if (prev.some(item => item.title === clean.title && item.author === clean.author)) {
        return prev;
      }
      return [...prev, clean];
    });

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        likedBooks: arrayUnion(clean),
      });
    } catch (error) {
      console.error('Beğenilen kitap eklenirken hata:', error);
    }
  };

  const removeLikedBook = async (book) => {
    if (!user) return;
    const clean = cleanBook(book);

    setLikedBooks((prev) => prev.filter(
      (item) => !(item.title === clean.title && item.author === clean.author)
    ));

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        likedBooks: arrayRemove(clean),
      });
    } catch (error) {
      console.error('Beğenilen kitap çıkarılırken hata:', error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        likedBooks,
        addLikedBook,
        removeLikedBook,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
