import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ artists: [], albums: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (value) => {
    if (value.length < 2) {
      setResults({ artists: [], albums: [] });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [artistsRes, albumsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/artists/search?q=${encodeURIComponent(value)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/albums/search?q=${encodeURIComponent(value)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      const [artistsData, albumsData] = await Promise.all([
        artistsRes.json(),
        albumsRes.json(),
      ]);

      setResults({
        artists: artistsData.slice(0, 3),
        albums: albumsData.rows
          ? albumsData.rows.slice(0, 3)
          : albumsData.slice(0, 3),
      });
    } catch (error) {
      setResults({ artists: [], albums: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleItemClick = async (item) => {
    try {
      const searchTerm = item.name || item.title;
      await router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
      setQuery(searchTerm);
    } catch (error) {
      alert(t('common.error.unexpected'));
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={t('common.search')}
          className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isDarkMode
              ? 'bg-[#2a2a2a] text-white placeholder-gray-400'
              : 'bg-white text-gray-900 placeholder-gray-500'
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {showResults && query.length >= 2 && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'
          }`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {results.artists.length === 0 && results.albums.length === 0 ? (
                <div
                  className={`p-4 text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('common.noResults')}
                </div>
              ) : (
                <div>
                  {results.artists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleItemClick(artist)}
                      className={`flex items-center p-3 cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 relative rounded-full overflow-hidden">
                        <Image
                          src={
                            typeof artist.image_url === 'string'
                              ? artist.image_url
                              : artist.image_url?.urls?.small?.png ||
                                'https://placehold.co/300x300/png'
                          }
                          alt={artist.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/300x300/png';
                          }}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {artist.name}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('navigation.artists')}
                        </p>
                      </div>
                    </div>
                  ))}

                  {results.albums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => handleItemClick(album)}
                      className={`flex items-center p-3 cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 relative rounded overflow-hidden">
                        <Image
                          src={
                            typeof album.image_url === 'string'
                              ? album.image_url
                              : album.image_url?.urls?.small?.png ||
                                'https://placehold.co/300x300/png'
                          }
                          alt={album.title}
                          width={40}
                          height={40}
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/300x300/png';
                          }}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {album.title}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('navigation.albums')}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(results.artists.length > 3 ||
                    results.albums.length > 3) && (
                    <div
                      onClick={handleSubmit}
                      className={`p-3 text-center cursor-pointer transition-colors ${
                        isDarkMode
                          ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-purple-400'
                          : 'bg-gray-50 hover:bg-gray-100 text-purple-600'
                      }`}
                    >
                      {t('common.viewAllResults')}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
