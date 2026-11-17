import {MongoClient} from 'mongodb';
import {seedUsers} from './seed.mjs';
const g=globalThis;
const conn=()=>g._j4||(g._j4=MongoClient.connect(process.env.MONGODB_URI).then(async client=>{const db=client.db(process.env.MONGODB_DB||'j4');await seedUsers(db);return{client,db}}).catch(e=>{g._j4=null;throw e}));
export const getDb=async()=>(await conn()).db;
export const getClient=async()=>(await conn()).client;
