import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Account } from '../accounts/account.schema';
import type { Response, Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: Account;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `http://localhost:5173/login?error=authentication_failed`,
      );
    }
    const { access_token } = await this.authService.loginWithProvider(user);
    return res.redirect(
      `http://localhost:5173/login/success?token=${access_token}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `http://localhost:5173/login?error=authentication_failed`,
      );
    }
    const { access_token } = await this.authService.loginWithProvider(user);

    return res.redirect(
      `http://localhost:5173/login/success?token=${access_token}`,
    );
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {}

  @Get('discord/redirect')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `http://localhost:5173/login?error=authentication_failed`,
      );
    }

    const { access_token } = await this.authService.loginWithProvider(user);

    return res.redirect(
      `http://localhost:5173/login/success?token=${access_token}`,
    );
  }
}
