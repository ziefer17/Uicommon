import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { View, ViewSchema } from './view.schema';
import { PointModule } from '../Points/point.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: View.name, schema: ViewSchema }]),
    PointModule,
  ],
  controllers: [ViewController],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
