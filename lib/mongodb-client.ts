// lib/mongodb.ts
import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('❌ Variable MONGODB_URI manquante');
}

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  retryWrites: true,
  w: 'majority',
  appName: 'nextjs-app',
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  tls: true, // Atlas nécessite TLS
  ssl: true
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(connectedClient => {
        console.log('✅ Connexion MongoDB (dev) établie');
        return connectedClient;
      })
      .catch(err => {
        console.error('❌ Erreur connexion MongoDB (dev):', err);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(connectedClient => {
      console.log('✅ Connexion MongoDB (prod) établie');
      return connectedClient;
    })
    .catch(err => {
      console.error('❌ Erreur connexion MongoDB (prod):', err);
      throw err;
    });
}

export default clientPromise;