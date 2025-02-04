import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function Albums() {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metadata, setMetadata] = useState({
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    totalPages: 0,
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchAlbums = useCallback(
    async (currentPage) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/albums?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error('Failed to fetch albums');

        const data = await response.json();
        setAlbums(data.data || []);
        if (data.metadata) {
          setMetadata(data.metadata);
        }
        setError(null);
      } catch (error) {
        setError(t('common.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchAlbums(page);
  }, [page, fetchAlbums]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredAlbums(albums);
      return;
    }

    const filtered = albums.filter((album) => {
      const titleMatch = album.title?.toLowerCase().includes(query);
      const genreMatch = Array.isArray(album.genre)
        ? album.genre.some((g) => g?.toLowerCase().includes(query))
        : album.genre?.toLowerCase().includes(query);
      return titleMatch || genreMatch;
    });

    setFilteredAlbums(filtered);
  };

  useEffect(() => {
    setFilteredAlbums(albums);
  }, [albums]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchAlbums(newPage);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('albums.title')} - ZakHarmony</title>
        <meta name="description" content={t('albums.description')} />
      </Head>

      <div
        className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1
                className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {t('albums.title')}
              </h1>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <input
                  type="text"
                  placeholder={t('albums.search')}
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className={`mb-8 p-4 rounded-lg ${
                isDarkMode
                  ? 'bg-red-900/20 border border-red-800 text-red-200'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={
                      album.image_url?.urls?.medium?.webp ||
                      '/placeholder-album.jpg'
                    }
                    alt={album.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <h3
                    className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {album.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(album.genre)
                      ? album.genre
                      : [album.genre]
                    ).map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    <p>{new Date(album.release_date).getFullYear()}</p>
                    <p>{t('albums.tracks', { count: album.total_tracks })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {metadata.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 disabled:text-gray-600'
                      : 'hover:bg-gray-100 disabled:text-gray-300'
                  } disabled:cursor-not-allowed`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {[...Array(metadata.totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isCurrentPage = pageNumber === page;

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isCurrentPage
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === metadata.totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 disabled:text-gray-600'
                      : 'hover:bg-gray-100 disabled:text-gray-300'
                  } disabled:cursor-not-allowed`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
