import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type FavouriteDocument = HydratedDocument<Favourite>;

@Schema()
export class Favourite {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: String, ref: 'Component', required: true })
  componentId: string;

  @Prop({ type: String, ref: 'Account', required: true })
  accountId: string;
}

export const FavouriteSchema = SchemaFactory.createForClass(Favourite);

// Tạo index unique để tránh duplicate
FavouriteSchema.index({ accountId: 1, componentId: 1 }, { unique: true });
