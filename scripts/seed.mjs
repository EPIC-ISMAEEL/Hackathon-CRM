import {MongoClient} from 'mongodb';
import {seedUsers} from '../lib/seed.mjs';
const c=await MongoClient.connect(process.env.MONGODB_URI);
console.log('Inserted users:',await seedUsers(c.db(process.env.MONGODB_DB||'j4')));
await c.close();
