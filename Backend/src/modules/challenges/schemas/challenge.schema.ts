import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ChallengeDocument = HydratedDocument<Challenge>;

@Schema({ timestamps: true })
export class Challenge {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  bannerImage: string; // URL to banner image

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: ['upcoming', 'active', 'rating', 'completed'],
    default: 'upcoming',
  })
  status: 'upcoming' | 'active' | 'rating' | 'completed';

  // Rules and requirements
  @Prop({ type: [String], default: [] })
  rules: string[];

  // Allowed component categories for this challenge
  @Prop({
    type: [String],
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
  allowedCategories: string[];

  // Prize structure
  @Prop({ type: Number, default: 2000 })
  firstPrize: number; // Points for 1st place

  @Prop({ type: Number, default: 1000 })
  secondPrize: number; // Points for 2nd place

  @Prop({ type: Number, default: 500 })
  thirdPrize: number; // Points for 3rd place

  // Who created this challenge
  @Prop({ type: String, ref: 'Account', required: true })
  createdBy: string;

  // Total submissions count (denormalized for performance)
  @Prop({ type: Number, default: 0 })
  submissionsCount: number;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

// Auto-update status based on dates
ChallengeSchema.pre('save', function (next) {
  const now = new Date();
  
  if (this.status === 'upcoming' && now >= this.startDate && now < this.endDate) {
    this.status = 'active';
  } else if (this.status === 'active' && now >= this.endDate) {
    this.status = 'rating';
  }
  
  next();
});
