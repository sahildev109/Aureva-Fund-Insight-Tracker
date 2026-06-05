const express = require('express');
const axios = require('axios');
const navCache = require('../cache/navCache');

const router = express.Router();

// GET /api/funds/search?q=<query>
router.get('/search', async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    const { data } = await axios.get(
      `${process.env.MFAPI_BASE}/mf/search?q=${encodeURIComponent(q.trim())}`,
      { timeout: 8000 }
    );

    // MFapi returns array of { schemeCode, schemeName }
    res.json(data.slice(0, 50)); // cap at 50 results
  } catch (err) {
    next(err);
  }
});

// GET /api/funds/:schemeCode
router.get('/:schemeCode', async (req, res, next) => {
  const code = req.params.schemeCode;

  if (!/^\d+$/.test(code)) {
    return res.status(400).json({ error: 'schemeCode must be numeric' });
  }

  const cacheKey = `nav_${code}`;
  const cached = navCache.get(cacheKey);

  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }

  try {
    const { data } = await axios.get(
      `${process.env.MFAPI_BASE}/mf/${code}`,
      { timeout: 10000 }
    );

    if (!data || !data.data) {
      return res.status(404).json({ error: 'Fund not found' });
    }

    navCache.set(cacheKey, data); // TTL set in navCache.js
    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Fund not found on MFapi' });
    }
    next(err);
  }
});

module.exports = router;
