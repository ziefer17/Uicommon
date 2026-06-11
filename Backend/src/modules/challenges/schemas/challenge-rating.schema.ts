import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ChallengeRatingDocument = HydratedDocument<ChallengeRating>;

@Schema({ timestamps: true })
export class ChallengeRating {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ type: String, ref: 'ChallengeSubmission', required: true })
  submissionId: string;

  @Prop({ type: String, ref: 'Account', required: true })
  reviewerId: string; // admin or reviewer who rated

  // Rating criteria (1-10 scale for each)
  @Prop({ type: Number, required: true, min: 1, max: 10 })
  creativity: number; // How creative/original is the design

  @Prop({ type: Number, required: true, min: 1, max: 10 })
  execution: number; // Code quality and implementation

  @Prop({ type: Number, required: true, min: 1, max: 10 })
  adherence: number; // How well it follows challenge rules

  // Optional feedback
  @Prop({ type: String })
  feedback?: string;

  // Total score (sum of all criteria) - NOT required, calculated automatically
  @Prop({ type: Number })
  totalScore: number;

  @Prop({ type: Date, default: Date.now })
  ratedAt: Date;
}

export const ChallengeRatingSchema = SchemaFactory.createForClass(ChallengeRating);

// Prevent duplicate ratings from same reviewer
ChallengeRatingSchema.index({ submissionId: 1, reviewerId: 1 }, { unique: true });

// Auto-calculate total score before validation (not just before save)
ChallengeRatingSchema.pre('validate', function (next) {
  this.totalScore = this.creativity + this.execution + this.adherence;
  next();
});
