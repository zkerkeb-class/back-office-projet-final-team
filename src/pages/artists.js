import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Image from 'next/image';

export default function Artists() {
  const { t } = useTranslation();
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const VALID_GENRES = [
    'pop',
    'rock',
    'jazz',
    'classical',
    'electronic',
    'hip-hop',
    'rnb',
  ];
  const GENRE_DISPLAY_NAMES = {
    pop: 'Pop',
    rock: 'Rock',
    jazz: 'Jazz',
    classical: 'Classical',
    electronic: 'Electronic',
    'hip-hop': 'Hip-Hop',
    rnb: 'R&B',
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  useEffect(() => {
    if (selectedArtist) {
      setSelectedGenres(
        typeof selectedArtist.genre === 'string'
          ? selectedArtist.genre.split(', ').filter(Boolean)
          : Array.isArray(selectedArtist.genre)
            ? selectedArtist.genre
            : [],
      );
    } else {
      setSelectedGenres([]);
    }
  }, [selectedArtist]);

  const handleGenreClick = (genre) => {
    // S'assurer que le genre est valide avant de l'ajouter
    if (!VALID_GENRES.includes(genre.toLowerCase())) {
      alert(
        `Genre invalide. Les genres valides sont: ${VALID_GENRES.join(', ')}`,
      );
      return;
    }

    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [genre];
      }
    });
  };

  const onSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');

      // Validation du genre
      if (selectedGenres.length === 0) {
        alert('Veuillez sélectionner au moins un genre');
        return;
      }

      // Récupérer le genre sélectionné et vérifier qu'il est valide
      const selectedGenre = selectedGenres[0];

      // Vérifier si le genre est exactement dans la liste des genres valides
      if (!VALID_GENRES.includes(selectedGenre)) {
        alert(
          `Genre invalide. Les genres valides sont: ${VALID_GENRES.join(', ')}`,
        );
        return;
      }

      // Construction des données de l'artiste
      const artistData = {
        name: formData.name.trim(),
        genre: selectedGenre, // Utiliser le genre tel quel car il est déjà validé
        country: formData.country?.trim() || '',
        bio: formData.bio?.trim() || '',
        image_url: formData.image_url?.trim() || '',
        phonetic_title: formData.name.trim().toLowerCase(),
      };

      const url = selectedArtist
        ? `${process.env.NEXT_PUBLIC_API_URL}/artists/${selectedArtist.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/artists`;

      const response = await fetch(url, {
        method: selectedArtist ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(artistData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur lors de la sauvegarde: ${errorData}`);
      }

      await fetchArtists();
      setIsModalOpen(false);
      setSelectedArtist(null);
      reset();
    } catch (error) {
      alert(error.message);
    }
  };

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
                  setIsModalOpen(true);
                  setSelectedArtist(null);
                  reset();
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
                          setSelectedArtist(artist);
                          setIsModalOpen(true);
                          reset({
                            name: artist.name,
                            genre: artist.genre,
                            country: artist.country,
                            bio: artist.bio,
                            image_url:
                              typeof artist.image_url === 'string'
                                ? artist.image_url
                                : artist.image_url?.urls?.original?.png,
                          });
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

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div
                className={`relative w-full max-w-2xl p-8 rounded-2xl shadow-2xl transform transition-all duration-200 ${
                  isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {selectedArtist ? t('artists.edit') : t('artists.add')}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium">
                      {t('artists.fields.name')}
                    </label>
                    <input
                      {...register('name', {
                        required: t('artists.validation.nameRequired'),
                      })}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-[#1a1a1a] border-gray-700'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      {t('artists.fields.genre')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VALID_GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreClick(genre)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedGenres.includes(genre)
                              ? isDarkMode
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600 text-white'
                              : isDarkMode
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {GENRE_DISPLAY_NAMES[genre] ||
                            genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </button>
                      ))}
                    </div>
                    {selectedGenres.length === 0 && (
                      <span className="text-red-500 text-sm mt-1">
                        {t('artists.validation.genreRequired')}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      {t('artists.fields.country')}
                    </label>
                    <input
                      {...register('country')}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-[#1a1a1a] border-gray-700'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Bio</label>
                    <textarea
                      {...register('bio')}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-[#1a1a1a] border-gray-700'
                          : 'bg-white border-gray-300'
                      }`}
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Image URL</label>
                    <input
                      {...register('image_url')}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-[#1a1a1a] border-gray-700'
                          : 'bg-white border-gray-300'
                      }`}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedArtist(null);
                        reset();
                      }}
                      className={`px-6 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
