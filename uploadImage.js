const request = require('request');
const fs = require('fs');

function uploadImg(url, Cookie, fileName) {
  return new Promise(function (resolve, reject) {
    const formData = {
      chunk: 0,
      chunks: 1,
      name: fileName,
      // Pass data via Streams
      file: fs.createReadStream(fileName),
    };
    request.post(
      {
        url,
        formData: formData,
        headers: {
          'User-Agent': 'request',
          Cookie
        }
      },
      function optionalCallback(err, _httpResponse, body) {
        if (err) {
          console.error('upload failed:', err);
          reject(err);
        }
        try {
          let obj = JSON.parse(body)
          resolve(obj.filenames[0])
        } catch (err) {
          reject(err)
        }
      }
    );
  });
}

module.exports = uploadImg;
