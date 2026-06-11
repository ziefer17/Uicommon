import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../authenticator/jwt-auth.guard';
import { AdminGuard } from '../authenticator/admin.guard';

interface AuthenticatedRequest extends Request {
  user?: { _id: string; email: string; role: string };
}

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(AdminGuard)
  @Get('eligible-for-promotion')
  async getEligibleUsers() {
    return this.accountService.getEligibleUsers();
  }

  @UseGuards(AdminGuard)
  @Get('reviewers')
  async getReviewers() {
    return this.accountService.getReviewers();
  }


  // 🟢 CREATE
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.accountService.create(createUserDto);
  }

  // 🟢 READ ALL
  @Get()
  async findAll() {
    return this.accountService.findAll();
  }

  // 🟢 READ ONE
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  // 🟡 UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateUserDto>,
  ) {
    return this.accountService.update(id, updateData);
  }

  // 🔴 DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  // 🧩 NEW: Get current logged-in user profile
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const account = await this.accountService.findById(req.user!._id);
    if (!account) return { message: 'Account not found' };

    return {
      _id: account._id,
      email: account.email,
      userName: account.userName,
      avatar: account.avatar,
      role: account.role,
    };
  }
// ====== role management (admin only)




  @UseGuards(AdminGuard)
  @Put(':id/promote')
  async promoteUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') userId: string,
    @Body() body: { role: 'reviewer' | 'moderator' },
  ) {
    const adminId = req.user!._id;
    return this.accountService.promoteUser(userId, body.role, adminId);
  }

  @UseGuards(AdminGuard)
  @Put(':id/demote')
  async demoteUser(@Param('id') userId: string) {
    return this.accountService.demoteUser(userId);
  }
}
