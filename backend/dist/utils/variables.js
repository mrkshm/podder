"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URI = exports.PORT = void 0;
const { env } = process;
exports.PORT = env.PORT || 8989;
exports.MONGO_URI = env.MONGO_URI || '';
