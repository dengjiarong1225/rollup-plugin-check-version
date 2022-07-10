import { createFilter } from '@rollup/pluginutils';

// rollup-plugin-my-example.js
export default function checkVersionPlugin ({ duration } = {}) {
  const filter = createFilter('index.html');

  const version = `{ "version": "V${new Date().getTime()}" }`

  return {
    name: 'rollup-plugin-check-version', // this name will show up in warnings and errors

    buildStart() {

      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: version
      });

      this.emitFile({
        type: 'asset',
        fileName: 'checkversion.js',
        source: `
          var timer = null;
            
          function autoCheckVersionPlugin() {
            var version = localStorage.getItem('appVersion');
      
            fetch('./version.json', { headers: { 'Cache-control': 'no-cache'  } }).then(res => {
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
        code: code.replace('</body>', '<script src="/checkversion.js"></script></body>'),
        map: { mappings: '' }
      };
    }
  };
}