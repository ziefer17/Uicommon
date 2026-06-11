import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserSettingDocument = UserSetting & Document;

@Schema()
export class UserSetting {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  company: string;

  @Prop({ default: '' })
  twitter: string;

  @Prop({ default: '' })
  website: string;

  @Prop({ default: '' })
  bio: string; // Ghi chú
}

@Schema()
export class UserAchievements {
  @Prop()
  userId: string;

  @Prop({ type: [String], default: [] })
  achievements: string[];
}

export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);
export const UserAchievementsSchema =
  SchemaFactory.createForClass(UserAchievements);
