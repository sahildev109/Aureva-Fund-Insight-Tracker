const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  schemeCode: { type: Number, required: true },
  schemeName: { type: String, required: true, trim: true },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: false });

// Prevent duplicate schemes per user
watchlistSchema.index({ userId: 1, schemeCode: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistSchema);
