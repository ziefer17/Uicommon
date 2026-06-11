import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  // Tự tham chiếu đến chính nó (self-referencing)
  @Prop({ type: String, ref: 'Comment', default: null })
  parentId: string | null;

  @Prop({ type: String, ref: 'Component', required: true })
  componentId: string;

  @Prop({ type: String, ref: 'Account', required: true })
  accountId: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
