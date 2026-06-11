import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ViewService } from './view.service';

interface AuthRequest extends Request {
  user?: { _id: string };
}

@Controller('views')
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Post(':componentId')
  async recordView(
    @Param('componentId') componentId: string,
    @Req() req: AuthRequest,
  ) {
    const accountId = req.user?._id;
    const ipAddress = req.ip || req.socket.remoteAddress;

    await this.viewService.recordView(componentId, accountId, ipAddress);
    return { success: true };
  }

  @Get('count/:componentId')
  async getViewCount(@Param('componentId') componentId: string) {
    const count = await this.viewService.getViewCount(componentId);
    return { count };
  }

  @Get('unique/:componentId')
  async getUniqueViewCount(@Param('componentId') componentId: string) {
    const count = await this.viewService.getUniqueViewCount(componentId);
    return { count };
  }
}
