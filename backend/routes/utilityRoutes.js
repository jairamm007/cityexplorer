const express = require('express');

const router = express.Router();

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

router.get('/image-proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid image URL' });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ message: 'Only http/https image URLs are allowed' });
    }

    const response = await fetch(parsed.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(400).json({ message: 'Unable to fetch image from URL' });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return res.status(400).json({ message: 'URL does not point to an image' });
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength && contentLength > MAX_IMAGE_BYTES) {
      return res.status(413).json({ message: 'Image is too large. Max 20MB is allowed.' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ message: 'Image is too large. Max 20MB is allowed.' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'Image proxy failed' });
  }
});

module.exports = router;
