require('dotenv/config');

module.exports = {
  ignoreFiles: ['content', 'package-lock.json', 'package.json', 'readme.md', 'web-ext-config.js'],
  artifactsDir: 'artifacts',
  sign: {
    apiKey: process.env.WEB_EXT_API_KEY || '',
    apiSecret: process.env.WEB_EXT_API_SECRET || '',
  },
  build: {
    overwriteDest: true,
  },
};
