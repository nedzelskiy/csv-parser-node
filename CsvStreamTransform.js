'use strict';

const stream = require('stream');

let boundary_ = '';

class CsvStreamTransform extends stream.Transform {
    constructor(boundary, options = {}) {
        boundary_ = boundary;
        options = Object.assign({}, options, {
            decodeStrings: false
        });
        super(options);
    }

    _transform(chunk, encoding, callback) {
        if ('utf8' !== encoding) {
            this.emit('error', new Error('only utf-8 supported!'));
            return callback();
        }
        if (
            !~chunk.indexOf(boundary_) && !~chunk.indexOf('Content-Disposition:') && !~chunk.indexOf('Content-Type:') && '' !== chunk.trim()
        ) {
            this.push(chunk + "\r\n");
        }
        callback();
    }
}

module.exports = CsvStreamTransform;