module.exports =  {
  resolve: {
    // .mjs needed to fix for https://github.com/graphql/graphql-js/issues/1272
    extensions: ['*', '.mjs', '.js', '.json', '.gql', '.graphql']
  },
  module: {
    rules: [ // fixes https://github.com/graphql/graphql-js/issues/1272
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
}

