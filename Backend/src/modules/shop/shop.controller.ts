import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ShopService } from './shop.service';

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

@UseGuards(AuthGuard('jwt'))
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  private uid(req: AuthenticatedRequest): string {
    if (!req.user?._id) throw new UnauthorizedException();
    return req.user._id;
  }

  // ── Cart ────────────────────────────────────────────────────────────

  @Get('cart')
  getCart(@Req() req: AuthenticatedRequest) {
    return this.shopService.getCart(this.uid(req));
  }

  @Post('cart/:componentId')
  addToCart(
    @Req() req: AuthenticatedRequest,
    @Param('componentId') componentId: string,
  ) {
    return this.shopService.addToCart(this.uid(req), componentId);
  }

  @Delete('cart/:componentId')
  removeFromCart(
    @Req() req: AuthenticatedRequest,
    @Param('componentId') componentId: string,
  ) {
    return this.shopService.removeFromCart(this.uid(req), componentId);
  }

  // ── Checkout ────────────────────────────────────────────────────────

  @Post('checkout')
  checkout(@Req() req: AuthenticatedRequest) {
    return this.shopService.checkout(this.uid(req));
  }

  // ── Purchases ───────────────────────────────────────────────────────
  // NOTE: specific paths must be declared before /:param routes

  @Get('purchases/ids')
  getPurchaseIds(@Req() req: AuthenticatedRequest) {
    return this.shopService.getPurchaseIds(this.uid(req));
  }

  @Get('purchases/check/:componentId')
  checkOwnership(
    @Req() req: AuthenticatedRequest,
    @Param('componentId') componentId: string,
  ) {
    return this.shopService.checkOwnership(this.uid(req), componentId);
  }

  @Get('purchases')
  getPurchases(@Req() req: AuthenticatedRequest) {
    return this.shopService.getPurchases(this.uid(req));
  }
}
