import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ViewDocument = HydratedDocument<View>;

@Schema({ timestamps: true })
export class View {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ type: String, ref: 'Component', required: true })
  componentId: string;

  @Prop({ type: String, ref: 'Account' }) // if logged in
  accountId?: string;

  @Prop({ type: Date, default: Date.now })
  viewedAt: Date;

  @Prop({ type: String })
  ipAddress?: string; // anonymous
}

export const ViewSchema = SchemaFactory.createForClass(View);
ViewSchema.index({ componentId: 1, accountId: 1 });
ViewSchema.index({ componentId: 1, ipAddress: 1 });
