import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Image from 'next/image';

export default function Artists() {
  const { t } = useTranslation();
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchArtists = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/artists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      alert(t('artists.errors.fetchFailed', { error: error.message }));
    }
  }, [t]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/artists/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          await fetchArtists();
        } else {
          // Ignore error on delete
        }
      } catch (error) {
        // Ignore error on delete
      }
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/artists/search?q=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        // Ignore search errors
      }
    } else if (query.length === 0) {
      fetchArtists();
    }
  };

  return (
    <>
      <Head>
        <title>{t('artists.title')} - ZakHarmony</title>
        <meta name="description" content={t('artists.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1
              className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}
            >
              {t('artists.title')}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('artists.search')}
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full sm:w-64 p-2 pl-10 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#1a1a1a] border-gray-700 text-white'
                      : 'bg-white border-gray-200'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => {
                  // TODO: Implement create artist
                }}
                className="px-6 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-lg"
              >
                {t('artists.add')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className={`rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-[#1a1a1a] hover:shadow-purple-500/20'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="relative h-64">
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
                    className="w-full h-full object-cover transition-transform duration-200"
                    onError={(e) => {
                      if (!e.target.hasAttribute('data-error')) {
                        e.target.setAttribute('data-error', 'true');
                        e.target.src = 'https://placehold.co/300x300/png';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {artist.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(artist.genre) ? (
                        artist.genre.map((g, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm rounded-full bg-purple-600 text-white"
                          >
                            {GENRE_DISPLAY_NAMES[g] ||
                              g.charAt(0).toUpperCase() + g.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 text-sm rounded-full bg-purple-600 text-white">
                          {GENRE_DISPLAY_NAMES[artist.genre] || artist.genre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p
                    className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <span className="font-semibold">
                      {t('artists.fields.country')}:
                    </span>{' '}
                    {artist.country}
                  </p>
                  <p
                    className={`mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    {artist.bio}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {artist.total_listeners?.toLocaleString() || 0}{' '}
                      {t('artists.listeners')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // TODO: Implement edit artist
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 group ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-purple-600'
                            : 'bg-gray-100 hover:bg-purple-600 hover:text-white'
                        }`}
                        title={t('common.edit')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(artist.id)}
                        className={`p-2 rounded-lg transition-all duration-200 group ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-red-600'
                            : 'bg-gray-100 hover:bg-red-600 hover:text-white'
                        }`}
                        title={t('common.delete')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
