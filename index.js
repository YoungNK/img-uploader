const uploader = require('./uploadImage');
const loaderUtils = require('loader-utils');
var path= require("path");
const { getDealed, dealPath, getResourceName } = require('./utils');

module.exports = function (content, _map, _meta) {
    const options = loaderUtils.getOptions(this);
    let recordFile = options.recordFile || '/src/asset/';
    recordFile = path.join(recordFile)
    let pathStr = dealPath(recordFile, this.context);
    let callback = this.async();
    let _this = this;
    getDealed(this._compilation, pathStr).then((dealResult) => {
        let hash = loaderUtils.interpolateName(this.context, "[hash]", { content });
        let name = getResourceName(recordFile, _this.resourcePath)
        if (dealResult.resource[hash]) {
            console.log('resource hash listed in record!  ->  ', name)
            callback(null, `module.exports = "${dealResult.resource[hash].url}"`);
        } else {
            uploader(options.url, options.cookie, _this.resourcePath).then((res) => {
                dealResult.resource[hash] = {
                    url: res,
                    name
                };
                console.log('upload success!  ->  ', name)
                dealResult.newAdd = dealResult.newAdd ? dealResult.newAdd + 1 : 1;
                callback(null, `module.exports = "${res}"`);
            }).catch((err) => {
                _this.emitError(err);
                callback(err);
            })
        }
    })
};

module.exports.raw = true;