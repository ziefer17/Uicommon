import { Injectable } from '@nestjs/common'; // 1. Nhớ import Injectable
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../accounts/account.service';

interface ProviderProfile {
  email: string;
  userName: string;
  avatar?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  async loginWithProvider(
    profile: ProviderProfile,
  ): Promise<{ access_token: string }> {
    const account = await this.accountService.findOrCreateAccount(profile);
    if (!account) {
      throw new Error('Account not found or created');
    }
    const payload = { sub: account._id, email: account.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
