const TemplateBuilder = require('../lib/templateBuilder')
const BundleBuilder = require('../lib/bundleBuilder')
const fs = require('fs-extra')
const path = require('path')
/**
 * Build template from json file
 * @param filePath
 */
exports.buildFromFile = (filePath, title, description, id, dir) => {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      throw err
    }
    const obj = JSON.parse(data)
    if (obj) {
      id = id || +new Date
      const builder = new TemplateBuilder(obj, title, description, id)
      const bundleDir = path.resolve(path.join(dir || path.dirname(filePath), id))
      const bundle = new BundleBuilder(bundleDir)
      bundle.structurize([ 'assets/meta', 'assets/elements' ])
        .createJSON(builder.build().getBuildTemplate(), 'bundle').then(() => {
        console.log('JSON bundle created')
      })
      bundle.download(builder.innerSources).then(() => {
        console.log('Template bundle created!')
      })
    }
  })
}
