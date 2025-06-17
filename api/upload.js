export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apikey = req.query.apikey;
  if (!apikey) {
    return res.status(400).json({ error: 'API Key is required' });
  }

  const form = new formidable.IncomingForm({ maxFileSize: 1024 * 1024 * 100 }); // 100MB
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(500).json({ error: 'Error parsing file' });
    }

    const file = files.file[0];

    try {
      const data = fs.createReadStream(file.filepath);
      const uploadRes = await fetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apikey}`,
        },
        body: data,
      });

      const result = await uploadRes.json();

      return res.status(uploadRes.status).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error uploading to pixeldrain' });
    }
  });
}
