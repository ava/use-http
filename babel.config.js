module.exports = api => {
  // Use only in test environment
  if (api.env('test')) {
    return {
      "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
      ]
    };
  }
};
