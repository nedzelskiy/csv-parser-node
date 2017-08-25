'use strict';

const chai = require('chai');
const split = require('split');
const Readable = require('stream').Readable;
const CsvStreamTransform = require('../services/CsvStreamTransform');

const boundary = '----';
const stringBoundary = '\r\n';

const testBodyDataStr =
`first,last,mail@gmail.com
Olive,Silva,mail@gmail.com`;


const testDataStr =
`-----WebKitFormBoundaryvIJJhlghEgnWEah8
Content-Disposition: form-data; name="file"; filename="filename.csv"
Content-Type: application/octet-stream

` + testBodyDataStr + `
------WebKitFormBoundaryvIJJhlghEgnWEah8--`;

const testTransformedData = "first,last,mail@gmail.com\r\nOlive,Silva,mail@gmail.com";

describe("CsvStreamTransform", () => {
    let stream
        ,transformedData
        ;

    beforeEach(() => {
        transformedData = '';
        stream = new Readable();
    });

    it('should delete headers from stream', next => {
        chai.assert.isTrue(testDataStr.indexOf('Content-Disposition') > -1);
        chai.assert.isTrue(testDataStr.indexOf('Content-Type') > -1);
        chai.assert.isTrue(testDataStr.indexOf('-----') > -1);

        stream.on('end', () =>{
            chai.assert.isTrue(transformedData.indexOf('Content-Disposition') < 0);
            chai.assert.isTrue(transformedData.indexOf('Content-Type') < 0);
            chai.assert.isTrue(transformedData.indexOf('-----') < 0);
            next();
        });

        stream
            .pipe(split())
            .pipe(new CsvStreamTransform(boundary))
            .on('data', chunkStr =>{
                transformedData += chunkStr;
            });

        stream.push(testDataStr);
        stream.push(null);
    });

    it("should add \\r\\n to each line end", next => {
        stream.on('end', () =>{
            chai.expect(transformedData.trim()).to.equal(testTransformedData.trim());
            next();
        });

        stream
            .pipe(split())
            .pipe(new CsvStreamTransform(boundary))
            .on('data', chunkStr =>{
                transformedData += chunkStr;
            });

        stream.push(testDataStr);
        stream.push(null);
    });
});