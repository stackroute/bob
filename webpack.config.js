var config = {
   entry: './main.js',

   output: {
      path:__dirname+'/',
      filename: 'index.js',
   },

   devServer: {
      inline: true,
      port: 8080
   },

   module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',

            query: {
               presets: ['es2015', 'react']
            }
         },

            {
         test: /\.css$/,
           loader: 'style-loader!css-loader?modules',
            include: /flexboxgrid/,
    }
      ]
   }
}

module.exports = config;
