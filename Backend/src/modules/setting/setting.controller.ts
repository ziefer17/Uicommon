import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../authenticator/jwt-auth.guard';
import { SettingService, UpdateSettingData } from './setting.service';

interface RequestWithUser extends Request {
  user: { _id: string };
}

@Controller('setting')
@UseGuards(JwtAuthGuard)
export class SettingController {
  // Inject SettingService
  constructor(private readonly service: SettingService) {}

  @Get('detailed-info')
  getDetailedInfo(@Req() req: RequestWithUser) {
    return this.service.getDetailedInfo(req.user._id);
  }

  @Put('detailed-info')
  updateDetailedInfo(
    @Req() req: RequestWithUser,
    @Body() body: UpdateSettingData,
  ) {
    return this.service.updateDetailedInfo(req.user._id, body);
  }

  @Get('basic-info')
  getBasicInfo(@Req() req: RequestWithUser) {
    return this.service.getBasicInfo(req.user._id);
  }

  @Put('basic-info')
  updateBasicInfo(
    @Req() req: RequestWithUser,
    @Body() body: { userName: string },
  ) {
    return this.service.updateBasicInfo(req.user._id, body.userName);
  }

  @Get('email')
  getEmail(@Req() req: RequestWithUser) {
    return this.service.getEmailSettings(req.user._id);
  }

  @Put('email')
  updateEmail(
    @Req() req: RequestWithUser,
    @Body() body: { emailNotifications: boolean },
  ) {
    return this.service.updateEmailSettings(
      req.user._id,
      body.emailNotifications,
    );
  }

  @Get('achievements')
  getAchievements(@Req() req: RequestWithUser) {
    return this.service.getAchievements(req.user._id);
  }

  @Put('achievements')
  updateAchievements(
    @Req() req: RequestWithUser,
    @Body() body: { achievements: string[] },
  ) {
    return this.service.updateAchievements(req.user._id, body.achievements);
  }

  @Get('stats')
  async getStats(@Req() req: RequestWithUser): Promise<any> {
    return await this.service.getStats(req.user._id);
  }

  @Delete('account')
  deleteAccount(@Req() req: RequestWithUser) {
    return this.service.deleteAccount(req.user._id);
  }
}
