import { createFilter } from '@rollup/pluginutils';

export default function checkVersionPlugin ({ duration } = {}) {
  const filter = createFilter('index.html');

  const selfConfig = {
    version: `{ "version": "V${new Date().getTime()}" }`,
    publicPath: ''
  }

  return {
    name: 'rollup-plugin-check-version',
    config(config) {
      selfConfig.publicPath = config.base
      if (selfConfig.publicPath && selfConfig.publicPath.substr(-1) !== '/') {
        selfConfig.publicPath += '/';
      }
    },

    buildStart() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: selfConfig.version
      });

      this.emitFile({
        type: 'asset',
        fileName: 'checkversion.js',
        source: `
          var timer = null;
            
          function autoCheckVersionPlugin() {
            var version = localStorage.getItem('appVersion');
      
            fetch('${selfConfig.publicPath}version.json', { headers: { 'Cache-control': 'no-cache'  } }).then(res => {
              res.json().then(json => {
                var newVersion = json.version
                if (newVersion !== version) {
                  console.log('setitem...')
                  localStorage.setItem('appVersion', newVersion)
                  location.reload()
                  console.log('reload end....')
                  clearInterval(timer)
                }
              })
            })
          }
          timer = setInterval(autoCheckVersionPlugin, ${duration});
        `
      
      });
    },

    transform(code, id) {
      if (!filter(id)) return;
      return {
        code: code.replace('</body>', `<script src="${selfConfig.publicPath}checkversion.js"></script></body>`),
        map: { mappings: '' }
      };
    }
  };
}