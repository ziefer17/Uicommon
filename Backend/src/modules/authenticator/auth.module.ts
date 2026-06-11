import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // 1. Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import để dùng biến môi trường
import { AccountModule } from '../accounts/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // 2. Import AuthService
import { GoogleStrategy } from './google.strategy';
// 3. Import JwtStrategy (sẽ tạo ở bước sau)
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './github.strategy';
import { DiscordStrategy } from './discord.strategy';

@Module({
  imports: [
    PassportModule,
    AccountModule,
    ConfigModule, // Đảm bảo ConfigModule đã được import
    // 4. Cấu hình JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Lấy secret từ file .env
        signOptions: { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
      }),
    }),
  ],
  controllers: [AuthController],
  // 5. Cung cấp các service và strategy cần thiết
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    GithubStrategy,
    DiscordStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
