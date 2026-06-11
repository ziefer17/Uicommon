import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../accounts/account.schema';

export type ComponentDocument = HydratedDocument<Component>;

@Schema({ timestamps: true })
export class Component {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ required: false })
  title?: string;

  @Prop({
    required: true,
    enum: [
      'button',
      'toggle switch',
      'checkbox',
      'card',
      'loader',
      'input',
      'form',
      'pattern',
      'radio buttons',
      'tooltips',
    ],
  })
  category: string;

  @Prop({ required: true })
  htmlCode: string;

  @Prop({ required: true })
  cssCode: string;

  @Prop() reactCode?: string;
  @Prop() vueCode?: string;
  @Prop() litCode?: string;
  @Prop() svelteCode?: string;

  @Prop({
    type: String,
    enum: ['draft', 'public', 'rejected', 'review'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Number, default: 2, min: 0 })
  price: number;

  @Prop({ type: String, ref: 'Account', required: true })
  accountId: string;

  @Prop({ type: Types.ObjectId, ref: 'Component' })
  parentId?: Types.ObjectId;

  @Prop({ type: String, ref: 'Challenge' })
  challengeId?: string;

  account?: Account;
}

export const ComponentSchema = SchemaFactory.createForClass(Component);

ComponentSchema.pre('save', function (next) {
  if (!this.title && this.category) {
    this.title = this.category.charAt(0).toUpperCase() + this.category.slice(1);
  }
  next();
});
