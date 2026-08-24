module.exports = {
  plugins: [
    require('postcss-preset-env')({
      features: {
        'environment-variables': {
          importFrom: [
            {
              environmentVariables: {
                'safe-area-inset-top': '0px',
                'safe-area-inset-bottom': '0px',
                'safe-area-inset-left': '0px',
                'safe-area-inset-right': '0px'
              }
            }
          ]
        }
      }
    }),
    require('postcss-env-function')({
      importFrom: 'src/styles/global.css' // Optional if you have global CSS
    })
  ]
};