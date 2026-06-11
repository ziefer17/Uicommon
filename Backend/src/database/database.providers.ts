// src/database/database.providers.ts
import { Mongoose } from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<Mongoose> =>
      await import('mongoose').then(({ connect }) =>
        connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uicommons'),
      ),
  },
];
