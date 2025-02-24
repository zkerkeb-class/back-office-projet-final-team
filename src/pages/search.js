import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { useDarkMode } from '../contexts/DarkModeContext';

const GENRE_DISPLAY_NAMES = {
  rock: 'Rock',
  pop: 'Pop',
  hip_hop: 'Hip Hop',
  electronic: 'Electronic',
  classical: 'Classical',
  jazz: 'Jazz',
  blues: 'Blues',
  country: 'Country',
  rnb: 'R&B',
  reggae: 'Reggae',
};

export default function SearchResults() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { q: searchQuery } = router.query;
  const [results, setResults] = useState({ artists: [], albums: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const [artistsRes, albumsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/artists/search?q=${encodeURIComponent(searchQuery)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/albums/search?q=${encodeURIComponent(searchQuery)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);

        if (!artistsRes.ok || !albumsRes.ok) {
          throw new Error('Erreur lors de la récupération des résultats');
        }

        const [artistsData, albumsData] = await Promise.all([
          artistsRes.json(),
          albumsRes.json(),
        ]);

        setResults({
          artists: artistsData,
          albums: albumsData.rows || albumsData,
        });
      } catch (error) {
        setError(t('common.error.unexpected'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, t]);

  const formatGenre = (genre) => {
    if (!genre) return 'Unknown';
    return (
      GENRE_DISPLAY_NAMES[genre.toLowerCase()] ||
      genre.charAt(0).toUpperCase() + genre.slice(1)
    );
  };

  const handleArtistClick = (artistId) => {
    router.push(`/artists?selected=${artistId}`);
  };

  const handleAlbumClick = (albumId) => {
    router.push(`/albums?selected=${albumId}`);
  };

  return (
    <>
      <Head>
        <title>
          {t('common.search')} - {searchQuery}
        </title>
      </Head>

      <div
        className={`min-h-screen ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleDarkMode} />

        <main className="container mx-auto px-4 py-8">
          <h1
            className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {t('common.searchResults')} &quot;{searchQuery}&quot;
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div
              className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-700'}`}
            >
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section Artistes */}
              {results.artists.length > 0 && (
                <section>
                  <h2
                    className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('navigation.artists')} ({results.artists.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => handleArtistClick(artist.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a]'
                            : 'bg-white hover:shadow-lg'
                        }`}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={
                              typeof artist.image_url === 'string'
                                ? artist.image_url
                                : artist.image_url?.urls?.medium?.png ||
                                  'https://placehold.co/300x300/png'
                            }
                            alt={artist.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/300x300/png';
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {artist.name}
                          </h3>
                          {artist.country && (
                            <p
                              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {artist.country}
                            </p>
                          )}
                          {artist.genre && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(Array.isArray(artist.genre)
                                ? artist.genre
                                : [artist.genre]
                              ).map((genre, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                                >
                                  {formatGenre(genre)}
                                </span>
                              ))}
                            </div>
                          )}
                          {artist.total_listeners !== undefined && (
                            <p
                              className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {artist.total_listeners.toLocaleString()}{' '}
                              {t('artists.listeners')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section Albums */}
              {results.albums.length > 0 && (
                <section>
                  <h2
                    className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('navigation.albums')} ({results.albums.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => handleAlbumClick(album.id)}
                        className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a]'
                            : 'bg-white hover:shadow-lg'
                        }`}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={
                              typeof album.image_url === 'string'
                                ? album.image_url
                                : album.image_url?.urls?.medium?.png ||
                                  'https://placehold.co/300x300/png'
                            }
                            alt={album.title}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/300x300/png';
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {album.title}
                          </h3>
                          {album.release_date && (
                            <p
                              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {new Date(album.release_date).getFullYear()}
                            </p>
                          )}
                          {album.genre && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(Array.isArray(album.genre)
                                ? album.genre
                                : [album.genre]
                              ).map((genre, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                                >
                                  {formatGenre(genre)}
                                </span>
                              ))}
                            </div>
                          )}
                          {album.total_tracks !== undefined && (
                            <p
                              className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {album.total_tracks} {t('albums.tracks')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {results.artists.length === 0 && results.albums.length === 0 && (
                <div
                  className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {t('common.noResults')}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
