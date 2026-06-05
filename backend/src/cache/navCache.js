const NodeCache = require('node-cache');

// stdTTL: seconds each key lives before auto-eviction
// checkperiod: how often expired keys are pruned (seconds)
const cache = new NodeCache({
  stdTTL: parseInt(process.env.NAV_CACHE_TTL, 10) || 3600,
  checkperiod: 120,
  useClones: false, // no deep clone for performance
});

module.exports = cache;
