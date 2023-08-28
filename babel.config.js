const plugins = [
  [
    'component',
    {
      libraryName: 'element-ui',
      styleLibraryName: 'theme-chalk',
    },
  ],
];

if (process.env.NODE_ENV !== 'development') {
  plugins.push('transform-remove-console');
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins,
  // plugins:[
  //     "componet",
  //     {
  //         "libraryName":"element-ui",
  //         "syyleLibraryName":"theme-chalk"
  //     }
  // ]
}
