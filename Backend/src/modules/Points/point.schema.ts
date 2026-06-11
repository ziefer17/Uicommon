import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserPointsHistoryDocument = HydratedDocument<UserPointsHistory>;

@Schema({ timestamps: true })
export class UserPointsHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  action: 'view' | 'favourite' | 'unfavourite' | 'upload' | 'challenge_prize';

  @Prop({ required: true })
  points: number;

  @Prop()
  componentId?: string;

  @Prop()
  challengeId?: string;
}

export const UserPointsHistorySchema =
  SchemaFactory.createForClass(UserPointsHistory);
