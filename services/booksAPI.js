export async function fetchBooksFromBackend() {
  try {
    const response = await fetch('http://192.168.0.13:8000/api/books/');
    const data = await response.json();

    return data.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author?.name || 'Bilinmiyor',
      description: book.description || 'Açıklama yok.',
      coverImageUrl: book.cover_image_url || null,
    }));
  } catch (error) {
    console.error('Kitap verisi alınamadı:', error);
    return [];
  }
}
