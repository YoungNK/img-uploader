const fs = require('fs');

module.exports = {
    getDealed(compilation, pathStr) {
        return new Promise(resolve => {
            if (compilation.__uploadedImages__) {
                resolve(compilation.__uploadedImages__);
            } else {
                let data;
                try {
                    //同步读取为了阻塞编译过程，防止异步读取多个资源同时进入该流程造成对象引用错误
                    data = fs.readFileSync(pathStr)
                    compilation.__uploadedImages__ = JSON.parse(data.toString())
                    compilation.__uploadedImages__.newAdd = 0;
                } catch (err) {
                    compilation.__uploadedImages__ = { resource: {}, length: 0, newAdd: 0 }
                } finally {
                    let imgStore = compilation.__uploadedImages__;
                    compilation.hooks.afterSeal.tap('write', () => {
                        imgStore.length = Object.keys(imgStore.resource).length;
                        fs.writeFile(pathStr, JSON.stringify(imgStore, null, 4), (err) => {
                            if (err) {
                                console.log('write error:' + JSON.stringify(err));
                            } else {
                                console.log(`new upload ${imgStore.newAdd} pictures,total contains ${imgStore.length} pictures`);
                            };
                        });
                    })
                    resolve(imgStore)
                }
            }
        })
    },
    dealPath(recordFile, context = '') {
        let index = context.indexOf(recordFile);
        return context.substring(0, index) + recordFile + 'imagesUploaded.json';
    },
    getResourceName(recordFile, path = '') {
        return path.substring(path.indexOf(recordFile))
    }
}