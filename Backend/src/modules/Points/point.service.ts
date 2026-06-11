import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPointsHistory } from './point.schema';

interface TotalPointsResult {
  _id: null;
  total: number;
}

@Injectable()
export class UserPointsService {
  constructor(
    @InjectModel(UserPointsHistory.name)
    private readonly pointsModel: Model<UserPointsHistory>,
  ) {}

  async addPoint(
    userId: string,
    componentId: string,
    action: 'view' | 'favourite' | 'unfavourite' | 'upload' | 'challenge_prize',
    points: number,
  ): Promise<UserPointsHistory> {
    return this.pointsModel.create({
      userId,
      componentId,
      action,
      points,
    });
  }

  async awardChallengePrize(
    userId: string,
    challengeId: string,
    componentId: string,
    points: number,
  ): Promise<UserPointsHistory> {
    return this.pointsModel.create({
      userId,
      componentId,
      challengeId,
      action: 'challenge_prize',
      points,
    });
  }

  async getTotalPoints(userId: string): Promise<number> {
    const result = await this.pointsModel.aggregate<TotalPointsResult>([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getPointsBreakdown(userId: string): Promise<any> {
    const breakdown = await this.pointsModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$action',
          total: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
    ]);

    return breakdown;
  }

  async getChallengeWinnings(userId: string): Promise<UserPointsHistory[]> {
    return this.pointsModel
      .find({ userId, action: 'challenge_prize' })
      .sort({ createdAt: -1 })
      .exec();
  }
}
