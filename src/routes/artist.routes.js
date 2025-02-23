const router = require('express').Router();
const { artistService } = require('../services');
const { isArtist, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { artistSchema } = require('./validations/music.validation');
const parseFormData = require('../middlewares/parseFormData.middleware');
const { uploadImage, handleMulterError } = require('../config/multer');
const { validateImageUpload } = require('../middlewares/cdn.middleware');

router.post(
  '/',
  isAdmin,
  uploadImage.single('image_url'),
  handleMulterError,
  validateImageUpload,
  parseFormData,
  validate(artistSchema),
  async (req, res, next) => {
    try {
      const artist = await artistService.create(req.body);
      res.status(201).json(artist);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/:id',
  isArtist,
  uploadImage.single('image_url'),
  handleMulterError,
  validateImageUpload,
  parseFormData,
  validate(artistSchema),
  async (req, res, next) => {
    try {
      if (
        req.user.artist_id !== parseInt(req.params.id) &&
        req.user.user_type !== 'admin'
      ) {
        return res
          .status(403)
          .json({ message: 'You can only update your own profile' });
      }

      const artist = await artistService.update(req.params.id, req.body);
      res.json(artist);
    } catch (error) {
      next(error);
    }
  },
);
