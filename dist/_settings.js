"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageJson = exports.PROJECT_DIR = exports.PRODUCTION = void 0;
// import * as dotenv from 'dotenv/config'
// const dotenv = require('dotenv').config();
const dotenv = __importStar(require("dotenv"));
const config = dotenv.config();
console.log('DEBUG:', process.env.DEBUG);
console.log('NODE_ENV:', process.env.NODE_ENV);
const PRODUCTION_STR = 'production';
exports.PRODUCTION = (process.env.NODE_ENV === PRODUCTION_STR);
exports.PROJECT_DIR = __dirname;
exports.packageJson = require('./package.json');
//# sourceMappingURL=_settings.js.map