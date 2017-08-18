'use strict';

const stream = require('stream');
const services = require('./services');

let boundary_ = '';

class CsvStreamTransform extends stream.Transform {
    constructor(boundary, options = {}) {
        boundary_ = boundary;
        options = Object.assign({}, options, {
            decodeStrings: false
        });
        super(options);
    }

    _transform(chunkStr, encoding, callback) {
        if ('utf8' !== encoding) {
            this.emit('error', new Error('only utf-8 supported!'));
            return callback();
        }
        if (services.isThisDataStrChunk(boundary_, chunkStr)) {
            this.push(chunkStr + "\r\n");
        }
        callback();
    }
}

module.exports = CsvStreamTransform;