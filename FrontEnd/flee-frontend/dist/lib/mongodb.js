"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI || '';
if (!uri)
    throw new Error('Missing MONGODB_URI');
const globalWithMongo = globalThis;
if (!globalWithMongo._mongoClientPromise) {
    const client = new mongodb_1.MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
}
exports.default = globalWithMongo._mongoClientPromise;
