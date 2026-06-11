import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true }) // Thêm timestamps để có createdAt, updatedAt
export class Account {
  // Ghi đè _id mặc định
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string; // Lưu ý: Mật khẩu nên được hash trước khi lưu

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ 
    type: String, 
    enum: ['user', 'reviewer', 'moderator', 'admin'], 
    default: 'user' 
  })
  role: 'user' | 'reviewer' | 'moderator' | 'admin';
  // account promoted by 
  @Prop({ type: String, ref: 'Account' })
  promotedBy?: string; 
  // account promoted when 
  @Prop({ type: Date })
  promotedAt?: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
