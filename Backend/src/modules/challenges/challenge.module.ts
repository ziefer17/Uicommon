import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { ChallengeSubmission, ChallengeSubmissionSchema } from './schemas/challenge-submission.schema';
import { ChallengeRating, ChallengeRatingSchema } from './schemas/challenge-rating.schema';
import { PointModule } from '../Points/point.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeSubmission.name, schema: ChallengeSubmissionSchema },
      { name: ChallengeRating.name, schema: ChallengeRatingSchema },
    ]),
    PointModule, // Import to use UserPointsService
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
