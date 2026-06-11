import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { format, subDays } from 'date-fns'; // Đã import đúng
import { Account, AccountDocument } from '../accounts/account.schema';
import { Component } from '../components/component.schema';
import { Favourite } from '../favourites/favourite.schema';
import { UserPointsHistory } from '../Points/point.schema';
import { UserSetting, UserAchievements } from './setting.schema';

export class UpdateSettingData {
  userName?: string;
  address?: string;
  company?: string;
  twitter?: string;
  website?: string;
  bio?: string;
}

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(UserSetting.name) private settingsModel: Model<UserSetting>,
    @InjectModel(UserAchievements.name)
    private achModel: Model<UserAchievements>,
    @InjectModel(Component.name) private comp: Model<Component>,
    @InjectModel(Favourite.name) private fav: Model<Favourite>,
    @InjectModel(UserPointsHistory.name)
    private points: Model<UserPointsHistory>,
  ) {}

  async getBasicInfo(userId: string) {
    const user = await this.accountModel
      .findById(userId)
      .select('userName email')
      .exec();
    if (!user) throw new NotFoundException('User not found');

    return {
      userName: user.userName,
      email: user.email,
    };
  }

  async updateBasicInfo(userId: string, newUserName: string) {
    const user = await this.accountModel
      .findByIdAndUpdate(userId, { userName: newUserName }, { new: true })
      .exec();

    if (!user) throw new NotFoundException('User not found');

    return { userName: user.userName, email: user.email };
  }

  async getDetailedInfo(userId: string) {
    const account = (await this.accountModel
      .findById(userId)
      .exec()) as AccountDocument;

    let settings = await this.settingsModel.findOne({ userId }).exec();

    if (!settings) {
      settings = await this.settingsModel.create({ userId });
    }

    return {
      userName: account?.userName || '',
      address: settings.address || '',
      company: settings.company || '',
      twitter: settings.twitter || '',
      website: settings.website || '',
      bio: settings.bio || '',
    };
  }

  async updateDetailedInfo(userId: string, data: UpdateSettingData) {
    if (data.userName) {
      await this.accountModel
        .findByIdAndUpdate(userId, {
          userName: data.userName,
        })
        .exec();
    }

    const updateData = {
      address: data.address,
      company: data.company,
      twitter: data.twitter,
      website: data.website,
      bio: data.bio,
    };

    await this.settingsModel
      .findOneAndUpdate({ userId }, updateData, {
        new: true,
        upsert: true,
      })
      .exec();

    return { message: 'Profile updated successfully' };
  }

  async getEmailSettings(userId: string) {
    let settings = await this.settingsModel.findOne({ userId }).exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        userId,
        emailNotifications: true,
      });
    }
    return settings;
  }

  async updateEmailSettings(userId: string, emailNotifications: boolean) {
    return this.settingsModel
      .findOneAndUpdate(
        { userId },
        { emailNotifications },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getAchievements(userId: string) {
    const ach = await this.achModel.findOne({ userId }).exec();
    if (ach) return ach;
    return await this.achModel.create({ userId, achievements: [] });
  }

  async updateAchievements(userId: string, achievements: string[]) {
    if (achievements.length > 4) achievements = achievements.slice(0, 4);

    return this.achModel
      .findOneAndUpdate(
        { userId },
        { achievements },
        { new: true, upsert: true },
      )
      .exec();
  }

  // 👇 ĐÂY LÀ PHẦN BẠN BỊ THIẾU 👇
  async getStats(userId: string) {
    const userIdString = userId.toString();

    // 1. Lấy số liệu tổng
    const totalPosts = await this.comp
      .countDocuments({ accountId: userIdString })
      .exec();

    const totalFavorites = await this.fav
      .countDocuments({ accountId: userIdString })
      .exec();

    const scoreAgg = (await this.points
      .aggregate([
        { $match: { userId: userIdString } },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ])
      .exec()) as { total: number }[];

    const score = scoreAgg.length > 0 ? scoreAgg[0].total : 0;

    // 2. Thống kê biểu đồ (Dùng createdAt có sẵn)
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Ép kiểu (casting) để tránh lỗi ESLint unsafe assignment
    const favoritesRaw = (await this.fav
      .aggregate([
        {
          $match: {
            accountId: userIdString,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec()) as { _id: string; count: number }[];

    // Khai báo kiểu mảng rõ ràng
    const chartData: { date: string; value: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM');

      const found = favoritesRaw.find((item) => item._id === dateKey);

      chartData.push({
        date: displayDate,
        value: found ? found.count : 0,
      });
    }

    return { totalPosts, totalFavorites, score, chartData };
  }
  // 👆 HẾT PHẦN BỊ THIẾU 👆

  async deleteAccount(userId: string) {
    const account = await this.accountModel.findById(userId).exec();

    if (!account) {
      throw new NotFoundException('User not found');
    }

    await this.accountModel.findByIdAndDelete(userId).exec();
    await this.settingsModel.deleteOne({ userId }).exec();
    await this.achModel.deleteOne({ userId }).exec();
    await this.comp.deleteMany({ accountId: userId }).exec();
    await this.fav.deleteMany({ accountId: userId }).exec();
    await this.points.deleteMany({ userId: userId }).exec();
    return { message: 'Account deleted' };
  }
}
