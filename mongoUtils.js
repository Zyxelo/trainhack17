import {MongoClient} from 'mongodb';
import config from './config';
import assert from 'assert';

let mdb;

export default {
    conncectToServer: (callback) => {
        MongoClient.connect(config.mongodbUri, (err, db) => {
            assert.equal(null, err);
            mdb = db;
            return callback(err);
        })
    },
    getDb: () => {
        return mdb;
    }
};


