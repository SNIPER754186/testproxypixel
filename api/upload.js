import fetch from 'node-fetch'; // si usas node 18+ ya no hace falta importarlo

export const config = {
  api: {
    bodyParser: false, // para manejar form-data manualmente (opcional)
  },
};

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // El API key lo pasamos en la query: /api/upload?apikey=...
    const apiKey = req.query.apikey || '';
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key no proporcionada' });
    }

    // Para reenviar el body con form-data, podemos usar busboy o alguna librería
    // pero para prueba rápida usaremos el raw body

    // Leer el buffer del body:
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    // Reenviar la petición a pixeldrain
    const response = await fetch('https://pixeldrain.com/api/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
      },
      body: rawBody,
    });

    const json = await response.json();

    // Responder con la respuesta de pixeldrain
    res.status(response.status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
