import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPointsHistory, UserPointsHistorySchema } from './point.schema';
import { UserPointsService } from './point.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPointsHistory.name, schema: UserPointsHistorySchema },
    ]),
  ],
  providers: [UserPointsService],
  exports: [UserPointsService],
})
export class PointModule {}
