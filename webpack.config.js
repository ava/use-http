/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  entry: {
    bundle: ['./index.ts']
  },
  context: path.resolve(__dirname),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'temp')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}
