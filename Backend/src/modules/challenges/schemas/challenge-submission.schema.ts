import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ChallengeSubmissionDocument = HydratedDocument<ChallengeSubmission>;

@Schema({ timestamps: true })
export class ChallengeSubmission {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ type: String, ref: 'Challenge', required: true })
  challengeId: string;

  @Prop({ type: String, ref: 'Component', required: true })
  componentId: string;

  @Prop({ type: String, ref: 'Account', required: true })
  userId: string;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  // Average rating from all reviewers
  @Prop({ type: Number, default: 0 })
  averageRating: number;

  // Total points from all ratings
  @Prop({ type: Number, default: 0 })
  totalScore: number;

  // Number of reviewers who rated this
  @Prop({ type: Number, default: 0 })
  ratingsCount: number;

  // Final rank (1, 2, 3, or null if not in top 3)
  @Prop({ type: Number })
  finalRank?: number;

  @Prop({
    type: String,
    enum: ['pending', 'rated', 'winner'],
    default: 'pending',
  })
  status: 'pending' | 'rated' | 'winner';
}

export const ChallengeSubmissionSchema = SchemaFactory.createForClass(ChallengeSubmission);

// Index for fast queries
ChallengeSubmissionSchema.index({ challengeId: 1, userId: 1 });
ChallengeSubmissionSchema.index({ challengeId: 1, totalScore: -1 }); // For leaderboard
