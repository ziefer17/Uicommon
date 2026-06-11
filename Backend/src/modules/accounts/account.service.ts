import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { Account, AccountDocument } from './account.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Component } from '../components/component.schema';
import { BadRequestException } from '@nestjs/common';

interface ProviderProfile {
  email: string;
  userName: string;
  avatar?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
  ) {}

  async findAll(): Promise<HydratedDocument<Account>[]> {
    return this.accountModel.find().exec();
  }

  async findOne(id: string): Promise<HydratedDocument<Account> | null> {
    return this.accountModel.findById(id).exec();
  }

  async findByProviderId(
    providerId: string,
    provider: string,
  ): Promise<HydratedDocument<Account> | null> {
    return this.accountModel.findOne({ providerId, provider });
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<HydratedDocument<Account>> {
    const createdUser = new this.accountModel(createUserDto);
    return createdUser.save();
  }

  async update(
    id: string,
    updateData: Partial<CreateUserDto>,
  ): Promise<HydratedDocument<Account> | null> {
    return this.accountModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<HydratedDocument<Account> | null> {
    return this.accountModel.findByIdAndDelete(id).exec();
  }

  async findOrCreateAccount(
    profile: ProviderProfile,
  ): Promise<HydratedDocument<Account>> {
    const { email, userName, avatar, provider, providerId } = profile;

    // Check if user already exists
    const existing = await this.accountModel
      .findOne({ providerId, provider })
      .exec();
    
    if (existing) {
      existing.userName = userName;
      if (avatar) existing.avatar = avatar;
      
      if (email === 'duothehiep@gmail.com' && existing.role !== 'admin') {
        console.log('Promoting user to admin:', email);
        existing.role = 'admin';
      }
      
      return existing.save();
    }

    // Create new account
    const role = email === 'duothehiep@gmail.com' ? 'admin' : 'user';
    
    console.log('Creating new account:', { email, role });
    
    const newAccount = new this.accountModel({
      email,
      userName,
      avatar,
      provider,
      providerId,
      role,
    });
    return newAccount.save();
  }

  // get profile voi posts
  async getProfile(accountId: string): Promise<any> {
    const account = await this.accountModel.findById(accountId).exec();
    if (!account) throw new Error('Account not found');

    const posts = await this.componentModel.find({ accountId }).exec();
    return {
      _id: account._id,
      userName: account.userName,
      email: account.email,
      avatar: account.avatar,
      posts,
    };
  }

  async findById(id: string) {
    return this.accountModel.findById(id).exec();
  }

  /**
   * Promote a user to reviewer or moderator
   * Only admins can promote users
   */
  async promoteUser(
    userId: string,
    newRole: 'reviewer' | 'moderator',
    promotedByAdminId: string,
  ): Promise<HydratedDocument<Account>> {
    const user = await this.accountModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prevent promoting admins
    if (user.role === 'admin') {
      throw new BadRequestException('Cannot change admin role');
    }

    // Validate new role
    if (!['reviewer', 'moderator'].includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    user.role = newRole;
    user.promotedBy = promotedByAdminId;
    user.promotedAt = new Date();

    return user.save();
  }

  async demoteUser(userId: string): Promise<HydratedDocument<Account>> {
    const user = await this.accountModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prevent demoting admins
    if (user.role === 'admin') {
      throw new BadRequestException('Cannot demote admin');
    }

    user.role = 'user';
    user.promotedBy = undefined;
    user.promotedAt = undefined;

    return user.save();
  }

  async getReviewers(): Promise<HydratedDocument<Account>[]> {
    return this.accountModel
      .find({ role: { $in: ['reviewer', 'moderator'] } })
      .populate('promotedBy', 'userName avatar')
      .exec();
  }

  async getEligibleUsers(): Promise<HydratedDocument<Account>[]> {
    return this.accountModel
      .find({ role: 'user' })
      .select('_id userName email avatar')
      .exec();
  }

  async getBasicInfo(userId: string) {
    const user = await this.accountModel
      .findById(userId)
      .select('userName email')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  // 2. Cập nhật thông tin cơ bản
  async updateBasicInfo(userId: string, newUserName: string) {
    const user = await this.accountModel
      .findByIdAndUpdate(userId, { userName: newUserName }, { new: true })
      .exec();

    if (!user) throw new NotFoundException('User not found');
    return { userName: user.userName, email: user.email };
  }
}
