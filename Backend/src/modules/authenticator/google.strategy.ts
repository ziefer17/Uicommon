import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from '../accounts/account.service';
import { Account } from '../accounts/account.schema';

interface IGoogleProfile {
  id: string;
  displayName: string;
  emails?: { value: string; verified: boolean }[];
  photos?: { value: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly accountService: AccountService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth environment variables');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    // Giữ nguyên `Profile` ở đây để tương thích với thư viện
    profile: Profile,
  ): Promise<Account> {
    console.log(
      '--- RAW GOOGLE PROFILE RECEIVED ---',
      JSON.stringify(profile, null, 2),
    );
    // ✅ BƯỚC 2: Sử dụng ép kiểu (Type Assertion) với Interface đã tạo
    //
    const { id, displayName, emails, photos } = profile as IGoogleProfile;

    const email = emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google account does not have an email.');
    }

    const userProfile = {
      email,
      userName: displayName ?? 'Google User',
      avatar: photos?.[0]?.value ?? '',
      provider: 'google',
      providerId: id,
    };

    const account = await this.accountService.findOrCreateAccount(userProfile);

    if (!account) {
      throw new UnauthorizedException(
        'Could not process Google authentication.',
      );
    }

    return account;
  }
}
