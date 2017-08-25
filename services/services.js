'use strict';

let services = {
    isThisDataStrChunk: (boundary, chunkStr) => {
        return (
                !~chunkStr.indexOf(boundary)
            &&  !~chunkStr.indexOf('Content-Disposition:')
            &&  !~chunkStr.indexOf('Content-Type:')
            &&  '' !== chunkStr.trim()
        );
    }
};

module.exports = services;