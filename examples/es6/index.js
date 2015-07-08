// Babel/register hook
require('babel/register', {
  // Optional ignore regex - if any filenames **do** match this regex then they
  // aren't compiled
  ignore: /node_modules/,
});
require('./app');
