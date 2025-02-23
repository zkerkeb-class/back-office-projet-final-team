import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const GENRE = {
  ROCK: 'Rock',
  POP: 'Pop',
  HIP_HOP: 'Hip Hop',
  ELECTRONIC: 'Electronic',
  CLASSICAL: 'Classical',
  JAZZ: 'Jazz',
  BLUES: 'Blues',
  COUNTRY: 'Country',
  RNB: 'R&B',
  REGGAE: 'Reggae',
};

const AlbumForm = ({ album, onSubmit, isDarkMode }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    release_date: '',
    genre: [],
    image_url: null,
    primary_artist_id: '',
    artist_ids: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (album) {
      setFormData({
        title: album.title || '',
        release_date: album.release_date
          ? new Date(album.release_date).toISOString().split('T')[0]
          : '',
        genre: Array.isArray(album.genre) ? album.genre : [album.genre],
        image_url: album.image_url || null,
        primary_artist_id: album.primary_artist_id || '',
        artist_ids: album.artist_ids || [],
      });
      if (album.image_url?.urls?.medium?.png) {
        setImagePreview(album.image_url.urls.medium.png);
      }
    }
  }, [album]);

  const GENRE_OPTIONS = Object.values(GENRE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleGenreChange = (genre) => {
    setFormData((prev) => {
      const newGenres = prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre];
      return {
        ...prev,
        genre: newGenres,
      };
    });
    setErrors((prev) => ({
      ...prev,
      genre: '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_url: file,
      }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({
        ...prev,
        image_url: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.title) {
      newErrors.title = t('albums.validation.titleRequired');
    }
    if (!formData.release_date) {
      newErrors.release_date = t('albums.validation.yearRequired');
    }
    if (!formData.genre || formData.genre.length === 0) {
      newErrors.genre = t('albums.validation.genreRequired');
    }
    if (!formData.primary_artist_id) {
      newErrors.primary_artist_id = t('albums.validation.artistRequired');
    }
    if (!formData.artist_ids || formData.artist_ids.length === 0) {
      formData.artist_ids = [formData.primary_artist_id];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formDataToSend = new FormData();

    // Ajouter les données sous forme de JSON string dans le champ 'data'
    const jsonData = {
      title: formData.title,
      release_date: formData.release_date,
      genre: formData.genre,
      primary_artist_id: parseInt(formData.primary_artist_id),
      artist_ids: formData.artist_ids.map((id) => parseInt(id)),
    };
    formDataToSend.append('data', JSON.stringify(jsonData));

    // Ajouter l'image si elle existe
    if (formData.image_url instanceof File) {
      formDataToSend.append('image_url', formData.image_url);
    }

    try {
      await onSubmit(formDataToSend);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.response?.data?.message || t('common.error.unexpected'),
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('albums.metadata.title')}
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          placeholder="Titre de l'album"
          value={formData.title}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="primary_artist_id"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('albums.metadata.artist')}
        </label>
        <input
          type="number"
          id="primary_artist_id"
          name="primary_artist_id"
          required
          min="1"
          placeholder="ID de l'artiste"
          value={formData.primary_artist_id}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
        {errors.primary_artist_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.primary_artist_id}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="release_date"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('albums.metadata.releaseYear')}
        </label>
        <input
          type="date"
          id="release_date"
          name="release_date"
          required
          value={formData.release_date}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
        {errors.release_date && (
          <p className="mt-1 text-sm text-red-600">{errors.release_date}</p>
        )}
      </div>

      <div>
        <label
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('albums.metadata.genre')}
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <label
              key={genre}
              className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer ${
                formData.genre.includes(genre)
                  ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.genre.includes(genre)}
                onChange={() => handleGenreChange(genre)}
                className="sr-only"
              />
              <span className="capitalize">{genre.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
        {errors.genre && (
          <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="image"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('media.cover')}
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Preview"
              width={96}
              height={96}
              className="h-24 w-24 object-cover rounded-lg"
            />
          )}
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className={`block w-full text-sm ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100`}
          />
        </div>
      </div>

      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {album ? t('common.save') : t('albums.add')}
        </button>
      </div>
    </form>
  );
};

export default AlbumForm;
