import { Schema } from 'mongoose';

export function MongooseCollectionPrefixPlugin(schema: Schema, options: { prefix: string }) {
  const { prefix } = options;
  
  // Get existing collection name or generate one based on model name
  let collectionName = schema.get('collection');
  
  // If no explicit collection name is set, Mongoose will use the pluralized model name.
  // We can force the collection name with the prefix.
  if (collectionName) {
    schema.set('collection', `${prefix}${collectionName}`);
  }
}
