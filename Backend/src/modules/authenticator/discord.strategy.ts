import { Profile, Strategy } from 'passport-discord';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Account } from '../accounts/account.schema';
import { AccountService } from '../accounts/account.service';

interface IDiscordProfile {
  id: string;
  displayName: string;
  emails?: { value: string; verified: boolean }[];
  photos?: { value: string }[];
}

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private readonly accountService: AccountService) {
    const clientID = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const callbackURL = process.env.DISCORD_CALLBACK_URL;

    // Để bảo mật, chúng ta chỉ kiểm tra xem secret có tồn tại hay không
    console.log(
      'DISCORD_CLIENT_SECRET being used: ',
      clientSecret ? 'Exists (********)' : undefined,
    );

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing discord OAuth environment variables');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    // Giữ nguyên `Profile` ở đây để tương thích với thư viện
    profile: Profile,
  ): Promise<Account> {
    console.log(
      '--- RAW discord PROFILE RECEIVED ---',
      JSON.stringify(profile, null, 2),
    );
    // ✅ BƯỚC 2: Sử dụng ép kiểu (Type Assertion) với Interface đã tạo
    //
    const { id, displayName, emails, photos } = profile as IDiscordProfile;

    const email = emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException(
        'Discord account does not have an email.',
      );
    }

    const userProfile = {
      email,
      userName: displayName ?? 'Discord User',
      avatar: photos?.[0]?.value ?? '',
      provider: 'discord',
      providerId: id,
    };

    const account = await this.accountService.findOrCreateAccount(userProfile);

    if (!account) {
      throw new UnauthorizedException(
        'Could not process Discord authentication.',
      );
    }

    return account;
  }
}
