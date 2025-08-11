"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
// const uri = process.env.MONGODB_URI || '';
const uri = 'mongodb+srv://carrold8:WuuqosEmPl7c6E6m@fleecluster.3sb6hhw.mongodb.net/?retryWrites=true&w=majority&appName=FleeCluster';
if (!uri)
    throw new Error('Missing MONGODB_URI');
const globalWithMongo = globalThis;
if (!globalWithMongo._mongoClientPromise) {
    const client = new mongodb_1.MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
}
exports.default = globalWithMongo._mongoClientPromise;
