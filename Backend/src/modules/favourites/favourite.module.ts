import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { Favourite, FavouriteSchema } from './favourite.schema';
import { PointModule } from '../Points/point.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favourite.name, schema: FavouriteSchema },
    ]),
    PointModule,
  ],
  controllers: [FavouriteController],
  providers: [FavouriteService],
  exports: [FavouriteService],
})
export class FavouriteModule {}
