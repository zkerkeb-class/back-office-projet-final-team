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

const ArtistForm = ({ artist, onSubmit, isDarkMode }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    genre: [],
    country: '',
    image_url: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (artist) {
      setFormData({
        name: artist.name || '',
        bio: artist.bio || '',
        genre: Array.isArray(artist.genre) ? artist.genre : [artist.genre],
        country: artist.country || '',
        image_url: artist.image_url || null,
      });
      if (artist.image_url?.urls?.medium?.png) {
        setImagePreview(artist.image_url.urls.medium.png);
      }
    }
  }, [artist]);

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

    // Validation
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = t('artists.validation.nameRequired');
      return;
    }
    if (!formData.genre || formData.genre.length === 0) {
      newErrors.genre = t('artists.validation.genreRequired');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formDataToSend = new FormData();

    // Ajouter les données sous forme de JSON string dans le champ 'data'
    const jsonData = {
      name: formData.name,
      genre: formData.genre,
      country: formData.country || '',
      bio: formData.bio || '',
      phonetic_name: formData.phonetic_name || '',
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
          htmlFor="name"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('artists.fields.name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="bio"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('artists.fields.description')}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
      </div>

      <div>
        <label
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('artists.fields.genre')}
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
          htmlFor="country"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {t('artists.fields.country')}
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'border-gray-300'
          } focus:border-purple-500 focus:ring-purple-500 sm:text-sm`}
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="image"
          className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Image
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

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {artist ? t('common.save') : t('artists.add')}
        </button>
      </div>
    </form>
  );
};

export default ArtistForm;
