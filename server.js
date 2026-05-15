require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.post('/api/claude', (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => { res.json(JSON.parse(data)); });
  });
  request.on('error', (err) => { res.status(500).json({ error: err.message }); });
  request.write(body);
  request.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AnatomIA server corriendo en puerto ${PORT}`));
