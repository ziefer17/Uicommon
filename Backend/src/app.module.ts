import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule và ConfigService
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './modules/accounts/account.module';
import { AuthModule } from './modules/authenticator/auth.module'; // 1. Import AuthModule
import { ComponentModule } from './modules/components/component.module';
import { FavouriteModule } from './modules/favourites/favourite.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewModule } from './modules/views/view.module';
import { CommentModule } from './modules/comments/comment.module';
import { PointModule } from './modules/Points/point.module';
import { LeaderboardModule } from './modules/ranking/leaderboard.module';
import { ChallengeModule } from './modules/challenges/challenge.module'; 
import { SettingModule } from './modules/setting/setting.module';
import { ShopModule } from './modules/shop/shop.module';
@Module({
  imports: [
    // 2. Thêm ConfigModule để đọc file .env trên toàn cục
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Chỉ định file env
    }),

    // Cấu hình Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Lấy chuỗi kết nối từ .env
      }),
    }),

    FavouriteModule,
    AccountModule,
    ComponentModule,
    AuthModule,
    ViewModule,
    CommentModule,
    PointModule,
    LeaderboardModule,
    ShopModule,
    ChallengeModule, 
    SettingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
