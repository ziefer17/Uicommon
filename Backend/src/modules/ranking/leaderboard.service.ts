import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../views/view.schema';
import { Favourite } from '../favourites/favourite.schema';
import { Component } from '../components/component.schema';
import { UserPointsHistory } from '../Points/point.schema'; // nếu bạn có file này

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(View.name) private viewModel: Model<View>,
    @InjectModel(Favourite.name) private favouriteModel: Model<Favourite>,
    @InjectModel(Component.name) private componentModel: Model<Component>,
    @InjectModel(UserPointsHistory.name)
    private pointsModel: Model<UserPointsHistory>,
  ) {}

  async getWeeklyTopElements(): Promise<any[]> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return this.componentModel.aggregate([
      {
        $match: { status: 'public' },
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'componentId',
          as: 'views',
          pipeline: [{ $match: { viewedAt: { $gte: oneWeekAgo } } }],
        },
      },
      {
        $lookup: {
          from: 'favourites',
          localField: '_id',
          foreignField: 'componentId',
          as: 'favourites',
          pipeline: [{ $match: { createdAt: { $gte: oneWeekAgo } } }],
        },
      },
      {
        $addFields: {
          weeklyViews: { $size: '$views' },
          weeklyFavourites: { $size: '$favourites' },
          score: {
            $add: [
              { $size: '$views' },
              { $multiply: [{ $size: '$favourites' }, 2] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },

      // populate author
      {
        $lookup: {
          from: 'accounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },

      {
        $project: {
          _id: 1,
          title: 1,
          htmlCode: 1,
          cssCode: 1,
          weeklyViews: 1,
          weeklyFavourites: 1,
          score: 1,
          author: {
            username: '$author.userName',
            avatar: '$author.avatar',
          },
        },
      },
    ]);
  }

  async getTopCreators(): Promise<any[]> {
    return this.pointsModel.aggregate([
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 20 },

      // Lấy thông tin user
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // ❗ Thêm postsCount bằng cách đếm số components thuộc user này
      {
        $lookup: {
          from: 'components',
          localField: '_id',
          foreignField: 'accountId',
          as: 'posts',
        },
      },
      {
        $addFields: {
          postsCount: { $size: '$posts' },
        },
      },

      {
        $project: {
          userId: '$_id',
          username: '$user.userName',
          avatar: '$user.avatar',
          totalPoints: 1,
          postsCount: 1,
        },
      },
    ]);
  }

  async getTopUsersByViews() {
    return this.viewModel.aggregate([
      {
        $lookup: {
          from: 'components',
          localField: 'componentId',
          foreignField: '_id',
          as: 'comp',
        },
      },
      { $unwind: '$comp' },

      {
        $group: {
          _id: '$comp.accountId',
          totalViews: { $sum: 1 },
        },
      },

      { $sort: { totalViews: -1 } },
      { $limit: 20 },

      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // THÊM PHẦN NÀY
      {
        $lookup: {
          from: 'components',
          localField: '_id',
          foreignField: 'accountId',
          as: 'posts',
        },
      },
      {
        $addFields: {
          postsCount: { $size: '$posts' },
        },
      },

      {
        $project: {
          userId: '$user._id',
          username: '$user.userName',
          avatar: '$user.avatar',
          totalViews: 1,
          postsCount: 1, // THÊM
        },
      },
    ]);
  }

  async getTopUsersByFavorites() {
    return this.favouriteModel.aggregate([
      {
        $lookup: {
          from: 'components',
          localField: 'componentId',
          foreignField: '_id',
          as: 'comp',
        },
      },
      { $unwind: '$comp' },

      {
        $group: {
          _id: '$comp.accountId',
          totalFavorites: { $sum: 1 },
        },
      },

      { $sort: { totalFavorites: -1 } },
      { $limit: 20 },

      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // THÊM
      {
        $lookup: {
          from: 'components',
          localField: '_id',
          foreignField: 'accountId',
          as: 'posts',
        },
      },
      {
        $addFields: {
          postsCount: { $size: '$posts' },
        },
      },

      {
        $project: {
          userId: '$user._id',
          username: '$user.userName',
          avatar: '$user.avatar',
          totalFavorites: 1,
          postsCount: 1, // THÊM
        },
      },
    ]);
  }
}
