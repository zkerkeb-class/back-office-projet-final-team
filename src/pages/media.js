import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function Media() {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    releaseYear: new Date().getFullYear(),
    genres: [],
    cover: null,
    audio: null,
    waveform: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const maxRetries = 3;

  const genreOptions = [
    'Rock',
    'Pop',
    'Hip-Hop',
    'Jazz',
    'Classical',
    'Electronic',
    'R&B',
    'Country',
    'Blues',
    'Metal',
    'Reggae',
  ];

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const generateWaveform = async (audioFile) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const audioData = await audioContext.decodeAudioData(reader.result);
          const channelData = audioData.getChannelData(0);
          const peaks = [];
          const sampleSize = Math.floor(channelData.length / 200);

          for (let i = 0; i < 200; i++) {
            const start = i * sampleSize;
            const end = start + sampleSize;
            let max = 0;

            for (let j = start; j < end; j++) {
              const absolute = Math.abs(channelData[j]);
              if (absolute > max) max = absolute;
            }

            peaks.push(max);
          }

          resolve(peaks);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioFile);
    });
  };

  const drawWaveform = useCallback(
    (peaks) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = isDarkMode ? '#a78bfa' : '#7c3aed';
      ctx.lineWidth = 2;

      const barWidth = width / peaks.length;
      peaks.forEach((peak, index) => {
        const x = index * barWidth;
        const barHeight = peak * height;
        ctx.beginPath();
        ctx.moveTo(x, height / 2 - barHeight / 2);
        ctx.lineTo(x, height / 2 + barHeight / 2);
        ctx.stroke();
      });
    },
    [isDarkMode],
  );

  useEffect(() => {
    if (formData.waveform) {
      drawWaveform(formData.waveform);
    }
  }, [formData.waveform, drawWaveform]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];

      if (name === 'audio') {
        try {
          const peaks = await generateWaveform(file);
          setFormData((prev) => ({
            ...prev,
            audio: file,
            waveform: peaks,
          }));
          setAudioPreview(URL.createObjectURL(file));
        } catch (err) {
          setError('Erreur lors de la génération du waveform');
          setValidationErrors((prev) => ({
            ...prev,
            audio: err.message,
          }));
        }
      } else if (name === 'cover') {
        const isValid = await handleImagePreview(file);
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            [name]: file,
          }));
        }
      }
    }
  };

  const validateMetadata = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    // Titre
    if (!formData.title.trim()) {
      errors.title = t('validation.titleRequired');
    } else if (formData.title.length < 2) {
      errors.title = t('validation.titleLength');
    }

    // Année
    if (!formData.releaseYear) {
      errors.releaseYear = t('validation.yearRequired');
    } else if (
      formData.releaseYear < 1900 ||
      formData.releaseYear > currentYear
    ) {
      errors.releaseYear = t('validation.yearRange');
    }

    // Genres
    if (!formData.genres || formData.genres.length === 0) {
      errors.genres = t('validation.selectGenre');
    }

    // Image de couverture
    if (!formData.cover) {
      errors.cover = t('validation.coverRequired');
    } else {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.cover.size > maxSize) {
        errors.cover = t('error.imageTooLarge');
      }
    }

    // Fichier audio
    if (!formData.audio) {
      errors.audio = t('validation.audioRequired');
    } else {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.audio.size > maxSize) {
        errors.audio = t('error.audioTooLarge');
      }
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      // Scroll jusqu'à la première erreur
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  };

  const handleImagePreview = async (file) => {
    if (!file) return;

    try {
      const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        throw new Error(t('error.unsupportedImage'));
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(t('error.imageTooLarge'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview({
          original: e.target.result,
          sizes: {
            thumbnail: e.target.result, // Simuler différentes tailles
            medium: e.target.result,
            large: e.target.result,
          },
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      return false;
    }
    return true;
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100,
      );
      drawPlaybackProgress(playbackProgress);
    }
  };

  const drawPlaybackProgress = (progress) => {
    if (!canvasRef.current || !formData.waveform) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    formData.waveform.forEach((peak, index) => {
      const x = (index / formData.waveform.length) * width;
      const barHeight = peak * height;

      // Dessiner la partie jouée en violet
      if ((x / width) * 100 <= progress) {
        ctx.strokeStyle = isDarkMode ? '#a78bfa' : '#7c3aed';
      } else {
        ctx.strokeStyle = isDarkMode ? '#4B5563' : '#D1D5DB';
      }

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - barHeight / 2);
      ctx.lineTo(x, height / 2 + barHeight / 2);
      ctx.stroke();
    });
  };

  const handleWaveformClick = (e) => {
    e.preventDefault();
    if (!audioRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = (x / canvas.width) * audioRef.current.duration;

    audioRef.current.currentTime = progress;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmitWithRetry = async (e) => {
    e.preventDefault();

    if (!validateMetadata()) {
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const upload = async () => {
      try {
        const formDataToSend = new FormData();

        if (formData.audio) {
          formDataToSend.append('audio', formData.audio);
        }

        if (formData.cover) {
          formDataToSend.append('image_url', formData.cover);
        }

        const trackData = {
          title: formData.title,
          genre: formData.genres,
          release_date: new Date(formData.releaseYear, 0).toISOString(),
          waveform: formData.waveform,
        };

        formDataToSend.append('data', JSON.stringify(trackData));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tracks`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formDataToSend,
            onUploadProgress: (progressEvent) => {
              const progress =
                (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress(Math.round(progress));
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t('media.error.uploadFailed'));
        }

        setFormData({
          title: '',
          releaseYear: new Date().getFullYear(),
          genres: [],
          cover: null,
          audio: null,
          waveform: null,
        });
        setUploadProgress(0);
        setAudioPreview(null);
        setImagePreview(null);
        setRetryCount(0);
      } catch (err) {
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          setError(
            t('media.error.retryAttempt', {
              count: retryCount + 1,
              max: maxRetries,
            }),
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return upload();
        }
        throw err;
      }
    };

    try {
      await upload();
    } catch (err) {
      setError(
        t('media.error.maxRetries', { max: maxRetries, message: err.message }),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>
          {t('navigation.media')} - {t('common.backoffice')}
        </title>
      </Head>

      <div
        className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-xl shadow-lg p-8`}
          >
            <h1
              className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {t('media.addTrack')}
            </h1>

            <form onSubmit={handleSubmitWithRetry} className="space-y-6">
              {/* Titre */}
              <div>
                <label
                  htmlFor="title"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('media.title')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-4 py-3 rounded-lg border transition-colors
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }
                    `}
                    placeholder={t('media.title')}
                  />
                  <div
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                      formData.title ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {formData.title && (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Année de sortie */}
              <div>
                <label
                  htmlFor="releaseYear"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('media.releaseYear')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="releaseYear"
                    name="releaseYear"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-4 py-3 rounded-lg border transition-colors
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }
                    `}
                    placeholder={new Date().getFullYear().toString()}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <div
                      className={`px-4 rounded-r-md border-l h-full flex items-center justify-center ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-400'
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <p
                  className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {t('media.releaseYear')} : 1900 - {new Date().getFullYear()}
                </p>
              </div>

              {/* Genres */}
              <div>
                <label
                  htmlFor="genres"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('media.genres')}
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {genreOptions.map((genre) => (
                    <label
                      key={genre}
                      className={`
                        flex items-center justify-center p-2 rounded-lg border cursor-pointer
                        ${
                          formData.genres.includes(genre)
                            ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        value={genre}
                        checked={formData.genres.includes(genre)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            genres: e.target.checked
                              ? [...prev.genres, value]
                              : prev.genres.filter((g) => g !== value),
                          }));
                        }}
                        className="sr-only"
                      />
                      {genre}
                    </label>
                  ))}
                </div>
              </div>

              {/* Cover */}
              <div>
                <label
                  htmlFor="cover"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('media.cover')}
                </label>
                <div className="mt-1">
                  <div
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg space-y-1 relative
                    ${isDarkMode 
                      ? 'border-gray-600 hover:border-purple-500' 
                      : 'border-gray-300 hover:border-purple-500'
                    }"
                  >
                    <div className="space-y-1 text-center">
                      {formData.cover ? (
                        <div className="relative group">
                          <Image
                            src={URL.createObjectURL(formData.cover)}
                            alt="Cover preview"
                            width={128}
                            height={128}
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                            <span className="text-white text-sm">Changer</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg
                            className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            <label
                              htmlFor="cover"
                              className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                            >
                              <span>{t('media.dragAndDrop')}</span>
                            </label>
                          </div>
                          <p
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {t('media.supportedFormats')}
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="cover"
                      name="cover"
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Audio */}
              <div>
                <label
                  htmlFor="audio"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('media.audio')}
                </label>
                <div className="mt-1">
                  <div
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg space-y-1 relative
                    ${isDarkMode 
                      ? 'border-gray-600 hover:border-purple-500' 
                      : 'border-gray-300 hover:border-purple-500'
                    }"
                  >
                    <div className="space-y-1 text-center">
                      {formData.audio ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              className="w-8 h-8 text-purple-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                              />
                            </svg>
                            <span
                              className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                            >
                              {formData.audio.name}
                            </span>
                          </div>
                          <div className="text-sm text-purple-600 hover:text-purple-500 cursor-pointer">
                            {t('media.dragAndDrop')}
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg
                            className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          <div
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            <label
                              htmlFor="audio"
                              className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                            >
                              <span>{t('media.dragAndDrop')}</span>
                            </label>
                          </div>
                          <p
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            MP3, WAV jusqu&apos;à 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="audio"
                      name="audio"
                      type="file"
                      required
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Preview */}
              {imagePreview && (
                <div className="mt-4 space-y-4">
                  <h3
                    className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('media.availableSizes')}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Image
                        src={imagePreview.sizes.thumbnail}
                        alt={t('media.thumbnail')}
                        width={150}
                        height={150}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {t('media.thumbnail')} (150x150)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Image
                        src={imagePreview.sizes.medium}
                        alt={t('media.medium')}
                        width={300}
                        height={300}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {t('media.medium')} (300x300)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Image
                        src={imagePreview.sizes.large}
                        alt={t('media.large')}
                        width={500}
                        height={500}
                        className="w-40 h-40 object-cover rounded-lg"
                      />
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {t('media.large')} (500x500)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {Object.keys(validationErrors).length > 0 && (
                <div
                  className={`mt-4 p-4 rounded-lg border-4 ${
                    isDarkMode
                      ? 'bg-red-900/20 border-red-800 text-red-200'
                      : 'bg-white border-[#D70040] text-[#D70040]'
                  }`}
                >
                  <h3 className="text-base font-bold">
                    {t('media.validation.title')}
                  </h3>
                  <ul className="mt-2 text-base list-disc list-inside">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field} className="font-bold">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200 dark:text-purple-200 dark:bg-purple-900">
                          {t('media.uploading')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-purple-600 dark:text-purple-200">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 dark:bg-purple-900/30">
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  className={`mt-4 p-4 rounded-lg border-4 ${
                    isDarkMode
                      ? 'bg-red-900/20 border-red-800 text-red-200'
                      : 'bg-white border-[#D70040] text-[#D70040]'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className={`h-6 w-6 ${isDarkMode ? 'text-red-200' : 'text-[#D70040]'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-bold">
                        {t('media.error.title')}
                      </h3>
                      <div className="mt-2 text-base font-bold">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Preview */}
              {audioPreview && (
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800"
                    >
                      {isPlaying ? (
                        <svg
                          className="w-6 h-6 text-purple-600 dark:text-purple-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-purple-600 dark:text-purple-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <audio
                        ref={audioRef}
                        src={audioPreview}
                        onTimeUpdate={handleAudioTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                      <div
                        className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                        onClick={handleWaveformClick}
                      >
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full"
                          width={800}
                          height={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton Submit */}
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${
                    isUploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  }`}
              >
                {isUploading ? t('media.uploading') : t('media.upload')}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
