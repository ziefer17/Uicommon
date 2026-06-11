import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Challenge, ChallengeDocument } from './schemas/challenge.schema';
import { ChallengeSubmission, ChallengeSubmissionDocument } from './schemas/challenge-submission.schema';
import { ChallengeRating, ChallengeRatingDocument } from './schemas/challenge-rating.schema';
import { UserPointsService } from '../Points/point.service';

export interface CreateChallengeDto {
  title: string;
  description: string;
  bannerImage: string;
  startDate: Date;
  endDate: Date;
  rules?: string[];
  allowedCategories: string[];
  firstPrize?: number;
  secondPrize?: number;
  thirdPrize?: number;
}

export interface SubmitToChallengeDto {
  challengeId: string;
  componentId: string;
}

export interface RateSubmissionDto {
  submissionId: string;
  creativity: number;
  execution: number;
  adherence: number;
  feedback?: string;
}

interface WinnerData {
  rank: number;
  userId: any;
  componentId: string;
  totalScore: number;
  prize: number;
}

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<ChallengeDocument>,
    @InjectModel(ChallengeSubmission.name)
    private submissionModel: Model<ChallengeSubmissionDocument>,
    @InjectModel(ChallengeRating.name)
    private ratingModel: Model<ChallengeRatingDocument>,
    private pointsService: UserPointsService,
  ) {}

  // ==================== CHALLENGE CRUD ====================

  async createChallenge(
    dto: CreateChallengeDto,
    adminId: string,
  ): Promise<Challenge> {
    const challenge = new this.challengeModel({
      ...dto,
      createdBy: adminId,
      status: new Date() >= dto.startDate ? 'active' : 'upcoming',
    });
    return challenge.save();
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return this.challengeModel
      .find()
      .sort({ startDate: -1 })
      .populate('createdBy', 'userName avatar')
      .exec();
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return this.challengeModel
      .find({ status: { $in: ['upcoming', 'active'] } })
      .sort({ startDate: -1 })
      .populate('createdBy', 'userName avatar')
      .exec();
  }

  async getPreviousChallenges(): Promise<Challenge[]> {
    return this.challengeModel
      .find({ status: { $in: ['rating', 'completed'] } })
      .sort({ endDate: -1 })
      .populate('createdBy', 'userName avatar')
      .exec();
  }

  async getChallengeById(id: string): Promise<Challenge> {
    const challenge = await this.challengeModel
      .findById(id)
      .populate('createdBy', 'userName avatar')
      .exec();
    
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }
    return challenge;
  }

  async updateChallenge(
    id: string,
    updateData: Partial<CreateChallengeDto>,
  ): Promise<Challenge> {
    const challenge = await this.challengeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }
    return challenge;
  }

  async deleteChallenge(id: string): Promise<void> {
    const result = await this.challengeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Challenge not found');
    }
  }

  // ==================== SUBMISSIONS ====================

  async submitToChallenge(
    dto: SubmitToChallengeDto,
    userId: string,
  ): Promise<ChallengeSubmission> {
    const challenge = await this.getChallengeById(dto.challengeId);

    // Validate challenge is active
    if (challenge.status !== 'active') {
      throw new BadRequestException('Challenge is not currently active');
    }

    // Check if already submitted
    const existing = await this.submissionModel
      .findOne({ challengeId: dto.challengeId, userId })
      .exec();

    if (existing) {
      throw new BadRequestException('You have already submitted to this challenge');
    }

    // Create submission
    const submission = new this.submissionModel({
      ...dto,
      userId,
      submittedAt: new Date(),
    });

    await submission.save();

    // Update challenge submissions count
    await this.challengeModel
      .findByIdAndUpdate(dto.challengeId, { $inc: { submissionsCount: 1 } })
      .exec();

    return submission;
  }

  async getChallengeSubmissions(challengeId: string): Promise<any[]> {
    return this.submissionModel
      .find({ challengeId })
      .populate('userId', 'userName avatar')
      .populate('componentId')
      .sort({ totalScore: -1, submittedAt: 1 })
      .exec();
  }

  async getUserSubmissions(userId: string): Promise<ChallengeSubmission[]> {
    return this.submissionModel
      .find({ userId })
      .populate('challengeId', 'title bannerImage status')
      .populate('componentId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  // ==================== RATING ====================

  async rateSubmission(
    dto: RateSubmissionDto,
    reviewerId: string,
  ): Promise<ChallengeRating> {
    const submission = await this.submissionModel
    .findById(dto.submissionId)
    .populate('challengeId')
    .exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // ✅ FIXED: Allow rating during 'active' and 'rating' phases
    const challenge = submission.challengeId as any;
    if (!['active', 'rating'].includes(challenge.status)) {
      throw new BadRequestException('Challenge is not accepting ratings');
    }

    // Check if reviewer already rated this submission
    const existingRating = await this.ratingModel
    .findOne({ submissionId: dto.submissionId, reviewerId })
    .exec();

    if (existingRating) {
      throw new BadRequestException('You have already rated this submission');
    }

    // Create rating
    const rating = new this.ratingModel({
      ...dto,
      reviewerId,
    });

    await rating.save();

    // Update submission's average rating and total score
    await this.updateSubmissionScore(dto.submissionId);

    return rating;
  }

  async updateSubmissionScore(submissionId: string): Promise<void> {
    const ratings = await this.ratingModel
      .find({ submissionId })
      .exec();

    if (ratings.length === 0) return;

    const totalScore = ratings.reduce((sum, r) => sum + r.totalScore, 0);
    const averageRating = totalScore / ratings.length;

    await this.submissionModel.findByIdAndUpdate(submissionId, {
      totalScore,
      averageRating,
      ratingsCount: ratings.length,
      status: 'rated',
    }).exec();
  }

  async getSubmissionRatings(submissionId: string): Promise<ChallengeRating[]> {
    return this.ratingModel
      .find({ submissionId })
      .populate('reviewerId', 'userName avatar role')
      .exec();
  }

  // ==================== FINALIZE WINNERS ====================

  async finalizeChallenge(challengeId: string): Promise<any> {
    const challenge = await this.getChallengeById(challengeId);

    if (challenge.status === 'completed') {
      throw new BadRequestException('Challenge already completed');
    }

    // Get top 3 submissions
    const submissions = await this.submissionModel
      .find({ challengeId })
      .sort({ totalScore: -1, submittedAt: 1 })
      .limit(3)
      .populate('userId')
      .exec();

    const winners: WinnerData[] = [];

    // Award prizes
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      const rank = i + 1;
      let prize = 0;

      if (rank === 1) prize = challenge.firstPrize;
      else if (rank === 2) prize = challenge.secondPrize;
      else if (rank === 3) prize = challenge.thirdPrize;

      // Update submission
      await this.submissionModel.findByIdAndUpdate(submission._id, {
        finalRank: rank,
        status: 'winner',
      }).exec();

      // ✅ Award points using the new specialized method
      await this.pointsService.awardChallengePrize(
        submission.userId as any,
        challengeId,
        submission.componentId,
        prize,
      );

      winners.push({
        rank,
        userId: submission.userId,
        componentId: submission.componentId,
        totalScore: submission.totalScore,
        prize,
      });
    }

    // Mark challenge as completed
    await this.challengeModel.findByIdAndUpdate(challengeId, {
      status: 'completed',
    }).exec();

    return {
      challenge,
      winners,
    };
  }

  // ==================== LEADERBOARD ====================

  async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    const submissions = await this.submissionModel
      .find({ challengeId })
      .populate('userId', 'userName avatar')
      .populate('componentId', 'title htmlCode cssCode')
      .sort({ totalScore: -1, submittedAt: 1 })
      .exec();

    return submissions.map((sub, index) => ({
      rank: index + 1,
      submission: sub,
      isWinner: sub.finalRank ? true : false,
    }));
  }
}
