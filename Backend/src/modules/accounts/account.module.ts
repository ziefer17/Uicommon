import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './account.schema';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { ProfileController } from './profile.controller';
import { Component, ComponentSchema } from '../components/component.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Component.name, schema: ComponentSchema },
    ]),
  ],
  controllers: [AccountController, ProfileController], // ✅ đúng
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
