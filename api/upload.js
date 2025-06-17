// api/upload.js
import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { apikey } = req.query;

  if (!apikey) {
    return res.status(400).json({ error: 'Falta la API Key' });
  }

  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append('file', buffer, {
      filename: req.headers['x-filename'] || 'archivo.bin',
      contentType: req.headers['content-type']
    });

    try {
      const response = await fetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        body: form,
        headers: {
          Authorization: `Bearer ${apikey}`,
          ...form.getHeaders()
        }
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error interno', detalle: err.message });
    }
  });
}
