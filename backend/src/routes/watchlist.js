const express = require('express');
const WatchlistItem = require('../models/WatchlistItem');
const auth = require('../middleware/auth');

const router = express.Router();

// All watchlist routes require auth
router.use(auth);

// GET /api/watchlist
router.get('/', async (req, res, next) => {
  try {
    const items = await WatchlistItem
      .find({ userId: req.userId })
      .sort({ addedAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

// POST /api/watchlist
router.post('/', async (req, res, next) => {
  try {
    const { schemeCode, schemeName } = req.body;
    if (!schemeCode || !schemeName)
      return res.status(400).json({ error: 'schemeCode and schemeName are required' });

    const item = await WatchlistItem.create({
      userId: req.userId,
      schemeCode: Number(schemeCode),
      schemeName,
    });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'Fund already in your watchlist' });
    next(err);
  }
});

// DELETE /api/watchlist/:schemeCode
router.delete('/:schemeCode', async (req, res, next) => {
  try {
    const result = await WatchlistItem.deleteOne({
      userId: req.userId,
      schemeCode: Number(req.params.schemeCode),
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Item not found in watchlist' });

    res.json({ message: 'Removed from watchlist' });
  } catch (err) { next(err); }
});

module.exports = router;
