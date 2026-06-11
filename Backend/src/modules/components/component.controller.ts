import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ComponentService, AggregatedComponent } from './component.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateComponentDto } from './dto/create-component.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AdminGuard } from '../authenticator/admin.guard';

interface AuthenticatedRequest extends Request {
  user?: { _id: string; email?: string };
}

@ApiTags('components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentService) {}

  // ====================================================================
  // CREATE
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateComponentDto,
  ) {
    const accountId = req.user?._id;
    if (!accountId) throw new UnauthorizedException('User not found');

    return this.componentsService.create({
      ...dto,
      accountId,
      categoryId: dto.categoryId ?? 'default-ui',
    });
  }

  // ====================================================================
  // PUBLIC LIST
  // ====================================================================
  @Get()
  async findAll(): Promise<AggregatedComponent[]> {
    return this.componentsService.findAll();
  }

  // ====================================================================
  // USER COMPONENTS
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @Get('user/:tab')
  async getUserComponents(
    @Req() req: AuthenticatedRequest,
    @Param('tab') tab: string,
  ) {
    if (!req.user?._id) throw new UnauthorizedException();
    return this.componentsService.findByUserAndStatus(req.user._id, tab);
  }

  // ====================================================================
  // ADMIN REVIEW QUEUE
  // ====================================================================
  @UseGuards(AdminGuard)
  @Get('review')
  async getReviewComponents() {
    const items = await this.componentsService.findByStatus('review');
    return (items ?? []) as AggregatedComponent[];
  }

  // ====================================================================

  @Get(':id/with-stats')
  async findOneWithStats(@Param('id') id: string) {
    return this.componentsService.findOneWithStats(id);
  }

  // ====================================================================
  // ⭐ GET ONE — BLOCK NONOWNER IF DRAFT
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const component = await this.componentsService.findOne(id);
    if (!component) throw new NotFoundException();

    const ownerId = component.accountId.toString();
    const viewerId = req.user!._id.toString();

    if (component.status === 'draft' && viewerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền truy cập element này.');
    }

    return component;
  }

  // ====================================================================
  // ⭐ UPDATE — ONLY OWNER
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateComponentDto>,
    @Req() req: AuthenticatedRequest,
  ) {
    const component = await this.componentsService.findOne(id);
    if (!component) throw new NotFoundException();

    if (component.accountId.toString() !== req.user!._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa.');
    }

    return this.componentsService.update(id, dto);
  }

  // ====================================================================
  // ⭐ DELETE — ONLY OWNER
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const component = await this.componentsService.findOne(id);
    if (!component) throw new NotFoundException();

    if (component.accountId.toString() !== req.user!._id.toString()) {
      throw new ForbiddenException('Không được phép xoá element này.');
    }

    return this.componentsService.remove(id);
  }

  // ====================================================================
  // ADMIN APPROVE
  // ====================================================================
  @UseGuards(AdminGuard)
  @Put(':id/approve')
  async approveComponent(@Param('id') id: string) {
    return this.componentsService.update(id, { status: 'public' });
  }

  // ====================================================================
  // ADMIN REJECT
  // ====================================================================
  @UseGuards(AdminGuard)
  @Put(':id/reject')
  async rejectComponent(@Param('id') id: string) {
    return this.componentsService.update(id, { status: 'rejected' });
  }
}
