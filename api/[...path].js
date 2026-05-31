const BACKEND_URL = process.env.BACKEND_URL;

module.exports = async function handler(req, res) {
  if (!BACKEND_URL) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 'BACKEND_URL nao configurada na Vercel'
    }));
    return;
  }

  const backend = BACKEND_URL.replace(/\/$/, '');
  const targetPath = req.url.replace(/^\/api/, '') || '/';
  const targetUrl = `${backend}${targetPath}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];

  const init = {
    method: req.method,
    headers
  };

  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    init.body = await readBody(req);
  }

  try {
    const response = await fetch(targetUrl, init);
    res.statusCode = response.status;

    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const body = Buffer.from(await response.arrayBuffer());
    res.end(body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 'Falha ao conectar no backend',
      detail: error instanceof Error ? error.message : String(error)
    }));
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
