const express = require('express');
const mongoose = require('mongoose');
const UploadedImage = require('../models/UploadedImage');

const router = express.Router();

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Image not found' });
  }

  try {
    const image = await UploadedImage.findById(req.params.id).select('contentType data size').lean();
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set({
      'Content-Type': image.contentType,
      'Content-Length': image.size,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load image' });
  }
});

module.exports = router;
