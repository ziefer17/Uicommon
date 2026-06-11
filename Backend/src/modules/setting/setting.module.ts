import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UserSetting,
  UserSettingSchema,
  UserAchievements,
  UserAchievementsSchema,
} from './setting.schema';

import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';

// existing schemas
import { Account, AccountSchema } from '../accounts/account.schema';
import { Component, ComponentSchema } from '../components/component.schema';
import { Favourite, FavouriteSchema } from '../favourites/favourite.schema';
import {
  UserPointsHistory,
  UserPointsHistorySchema,
} from '../Points/point.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // Đăng ký Schema mới
      { name: UserSetting.name, schema: UserSettingSchema },
      { name: UserAchievements.name, schema: UserAchievementsSchema },

      // Các Schema liên quan
      { name: Account.name, schema: AccountSchema },
      { name: Component.name, schema: ComponentSchema },
      { name: Favourite.name, schema: FavouriteSchema },
      { name: UserPointsHistory.name, schema: UserPointsHistorySchema },
    ]),
  ],
  controllers: [SettingController], // Sử dụng Controller mới
  providers: [SettingService], // Sử dụng Service mới
})
export class SettingModule {}
