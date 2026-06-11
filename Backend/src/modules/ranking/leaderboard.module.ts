import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { View, ViewSchema } from '../views/view.schema';
import { Favourite, FavouriteSchema } from '../favourites/favourite.schema';
import { Component, ComponentSchema } from '../components/component.schema';
import {
  UserPointsHistory,
  UserPointsHistorySchema,
} from '../Points/point.schema';

import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: View.name, schema: ViewSchema },
      { name: Favourite.name, schema: FavouriteSchema },
      { name: Component.name, schema: ComponentSchema },
      { name: UserPointsHistory.name, schema: UserPointsHistorySchema },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
