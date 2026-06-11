// File: src/modules/accounts/profile.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountDocument } from './account.schema';
import { AccountService } from './account.service';

interface AuthenticatedRequest {
  user: AccountDocument;
}

@Controller('profile')
export class ProfileController {
  constructor(private accountService: AccountService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    const accountId = req.user._id;
    const account = await this.accountService.findById(accountId);
    if (!account) return { message: 'Account not found' };

    return {
      _id: account._id,
      email: account.email,
      userName: account.userName,
      avatar: account.avatar,
      role: account.role,
    };
  }
}
