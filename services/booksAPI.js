export async function fetchTurkishBooks() {
  try {
    // Daha gerçekçi bir Türkçe sonuç araması
    const response = await fetch('https://openlibrary.org/search.json?q=Türkçe&limit=20');
    const json = await response.json();

    return json.docs
      .filter(book => book.title && book.author_name) // kitap başlığı ve yazar adı olanlar
      .map(book => ({
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Bilinmeyen',
        coverId: book.cover_i,
      }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
