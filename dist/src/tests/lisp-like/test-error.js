"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    base_dir: './demo',
    version: '2.5.22',
    actions: {
        default: ['$echo', 'Any of the tests here will immediately exit the process, so they are not default'],
        errorUserMsg: ['error', 'This is the error message'],
        errorDefaultMsg: ['error', 'This is the error message'],
    },
};
exports.default = exports.config;
//# sourceMappingURL=test-error.js.map