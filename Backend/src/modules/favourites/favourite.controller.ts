import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { FavouriteService } from './favourite.service';
import { JwtAuthGuard } from '../authenticator/jwt-auth.guard';

interface JwtRequest extends Request {
  user: { _id: string; email: string };
}

@Controller('favourites')
@UseGuards(JwtAuthGuard)
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post('toggle')
  async toggleFavourite(
    @Req() req: JwtRequest,
    @Body() body: { componentId: string },
  ) {
    const accountId = req.user._id;
    return this.favouriteService.toggleFavourite(accountId, body.componentId);
  }

  @Get('check/:componentId')
  async checkIsFavourite(
    @Req() req: JwtRequest,
    @Param('componentId') componentId: string,
  ) {
    const accountId = req.user._id;
    const isFavourite = await this.favouriteService.isFavourite(
      accountId,
      componentId,
    );
    return { isFavourite };
  }

  @Get('list')
  async listFavourites(@Req() req: JwtRequest) {
    const accountId = req.user._id;
    return this.favouriteService.getFavouritesWithStats(accountId);
  }

  @Get('count/:componentId')
  async getCount(@Param('componentId') componentId: string) {
    const count = await this.favouriteService.getCountByComponent(componentId);
    return { count };
  }
}
