import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';

const app = express();
app.use(cors());

const upload = multer({ memory: true });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const formData = new FormData();

    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    console.log('Sending request to Walrus Store...');
    // const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100', {
    const response = await fetch('https://walrus-testnet-publisher.nodes.guru/v1/store?epochs=100', {
      method: 'PUT',
      body: req.file.buffer,
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      res.status(response.status).send(responseText);
      return;
    }

    try {
      const data = JSON.parse(responseText);
      res.json(data);
    } catch (e) {
      res.status(500).json({
        error: `Invalid JSON response: ${responseText}`,
        details: e.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});