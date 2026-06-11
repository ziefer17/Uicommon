import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: String, ref: 'Account', required: true, unique: true })
  accountId: string;

  @Prop({ type: [String], default: [] })
  componentIds: string[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
