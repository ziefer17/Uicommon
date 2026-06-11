import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './cart.schema';
import { Order } from './order.schema';
import { Component } from '../components/component.schema';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Component.name) private componentModel: Model<Component>,
  ) {}

  private async getOrCreateCart(accountId: string) {
    return (
      (await this.cartModel.findOne({ accountId })) ??
      (await this.cartModel.create({ accountId, componentIds: [] }))
    );
  }

  // ── Cart ────────────────────────────────────────────────────────────

  async getCart(accountId: string) {
    const cart = await this.getOrCreateCart(accountId);
    const items = await this.componentModel
      .find({ _id: { $in: cart.componentIds } })
      .select('_id title category price accountId')
      .lean();
    return { total: items.length, items };
  }

  async addToCart(accountId: string, componentId: string) {
    const component = await this.componentModel.findById(componentId).lean();
    if (!component) throw new NotFoundException('Component not found');
    if (component.status !== 'public')
      throw new BadRequestException('Component is not available');
    if ((component.accountId as string) === accountId)
      throw new BadRequestException('You cannot buy your own component');

    const alreadyOwned = await this.orderModel.findOne({ accountId, componentId });
    if (alreadyOwned) throw new BadRequestException('Already purchased');

    const cart = await this.getOrCreateCart(accountId);
    if (cart.componentIds.includes(componentId))
      throw new BadRequestException('Already in cart');

    cart.componentIds.push(componentId);
    await cart.save();
    return { total: cart.componentIds.length };
  }

  async removeFromCart(accountId: string, componentId: string) {
    const cart = await this.getOrCreateCart(accountId);
    cart.componentIds = cart.componentIds.filter((id) => id !== componentId);
    await cart.save();
    return { total: cart.componentIds.length };
  }

  // ── Checkout ────────────────────────────────────────────────────────

  async checkout(accountId: string) {
    const cart = await this.getOrCreateCart(accountId);
    if (!cart.componentIds.length) throw new BadRequestException('Cart is empty');

    const components = await this.componentModel
      .find({ _id: { $in: cart.componentIds } })
      .lean();

    // Safety net: skip already-purchased items
    const existing = await this.orderModel
      .find({ accountId, componentId: { $in: cart.componentIds } })
      .lean();
    const ownedIds = new Set(existing.map((o) => o.componentId));
    const toPurchase = components.filter((c) => !ownedIds.has(c._id as string));

    if (!toPurchase.length)
      throw new BadRequestException('All cart items already purchased');

    const orders = await this.orderModel.insertMany(
      toPurchase.map((c) => ({
        accountId,
        componentId: c._id,
        price: (c as any).price ?? 4.99,
      })),
    );

    cart.componentIds = [];
    await cart.save();

    return {
      success: true,
      count: orders.length,
      total: toPurchase.reduce((sum, c) => sum + ((c as any).price ?? 4.99), 0),
      transactionIds: orders.map((o) => o.transactionId),
    };
  }

  // ── Purchases ───────────────────────────────────────────────────────

  async getPurchases(accountId: string) {
    const orders = await this.orderModel
      .find({ accountId })
      .sort({ createdAt: -1 })
      .lean();

    const ids = orders.map((o) => o.componentId);
    const components = await this.componentModel
      .find({ _id: { $in: ids } })
      .lean();

    const map = new Map(components.map((c) => [c._id as string, c]));
    return orders.map((o) => ({ ...o, component: map.get(o.componentId) ?? null }));
  }

  // Lightweight: just IDs — used by homepage to hide crown icons
  async getPurchaseIds(accountId: string): Promise<string[]> {
    const orders = await this.orderModel
      .find({ accountId })
      .select('componentId')
      .lean();
    return orders.map((o) => o.componentId);
  }

  // Used by detail page: creator always owns their own component
  async checkOwnership(
    accountId: string,
    componentId: string,
  ): Promise<{ owned: boolean }> {
    const component = await this.componentModel
      .findById(componentId)
      .select('accountId')
      .lean();
    if (!component) return { owned: false };
    if ((component.accountId as string) === accountId) return { owned: true };

    const order = await this.orderModel.findOne({ accountId, componentId });
    return { owned: !!order };
  }
}
