import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ type: String, ref: 'Account', required: true })
  accountId: string;

  @Prop({ type: String, ref: 'Component', required: true })
  componentId: string;

  @Prop({ type: Number, required: true })
  price: number;

  // Human-readable fake transaction ID, e.g. TXN-F3A6D2B8
  @Prop({
    type: String,
    default: () => `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
  })
  transactionId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Prevent buying the same component twice at the DB level
OrderSchema.index({ accountId: 1, componentId: 1 }, { unique: true });
