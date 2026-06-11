import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComponentService } from './component.service';
import { Component, ComponentSchema } from './component.schema';
import { ComponentsController } from './component.controller';
import { FavouriteSchema } from '../favourites/favourite.schema';
import { ViewSchema } from '../views/view.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Component.name, schema: ComponentSchema },
      { name: 'Favourite', schema: FavouriteSchema },
      { name: 'View', schema: ViewSchema },
    ]),
  ],
  controllers: [ComponentsController],
  providers: [ComponentService],
  exports: [ComponentService],
})
export class ComponentModule {}
