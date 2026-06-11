import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Component } from './component.schema';
import { CreateComponentDto } from './dto/create-component.dto';

export interface AggregatedComponent {
  _id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  category: string;
  status: string;
  viewsCount: number;
  favouritesCount: number;
  accountId: any;
  reactCode?: string;
  vueCode?: string;
  litCode?: string;
  svelteCode?: string;
}

@Injectable()
export class ComponentService {
  constructor(
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
    @InjectModel('Favourite') private favouriteModel: Model<any>,
    @InjectModel('View') private viewModel: Model<any>,
  ) {}

  async create(dto: CreateComponentDto): Promise<Component> {
    const newComponent = new this.componentModel({
      ...dto,
      status: dto.status ?? 'draft',
    });
    return newComponent.save();
  }

  async findAll(): Promise<AggregatedComponent[]> {
    return this.componentModel
      .aggregate<AggregatedComponent>([
        {
          $match: { status: 'public' },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'authorDetails',
          },
        },
        {
          $unwind: {
            path: '$authorDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'views',
            localField: '_id',
            foreignField: 'componentId',
            as: 'views',
          },
        },
        {
          $lookup: {
            from: 'favourites',
            localField: '_id',
            foreignField: 'componentId',
            as: 'favourites',
          },
        },
        {
          $addFields: {
            viewsCount: { $size: '$views' },
            favouritesCount: { $size: '$favourites' },

            accountId: {
              $cond: {
                if: { $gt: ['$authorDetails', null] }, // ⭐ SỬA TẠI ĐÂY
                then: {
                  _id: '$authorDetails._id',
                  userName: '$authorDetails.userName',
                  avatar: '$authorDetails.avatar',
                },
                else: null,
              },
            },
          },
        },
        {
          $project: {
            views: 0,
            favourites: 0,
            authorDetails: 0,
          },
        },
      ])
      .exec();
  }

  // ⭐ FIX: KHÔNG POPULATE → accountId trả về string
  async findOne(id: string): Promise<Component | null> {
    return this.componentModel.findById(id).exec();
  }

  async findByUserAndStatus(
    accountId: string,
    tab: string,
  ): Promise<Component[]> {
    const query: FilterQuery<Component> = { accountId };

    if (tab === 'post') query.status = 'public';
    else if (tab === 'variations') query.status = 'public';
    else if (tab === 'review') query.status = 'review';
    else if (tab === 'rejected') query.status = 'rejected';
    else if (tab === 'draft') query.status = 'draft';
    else throw new Error('Invalid tab');

    return this.componentModel.find(query).exec();
  }

  async update(id: string, updateData: Partial<CreateComponentDto>) {
    return this.componentModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string) {
    return this.componentModel.findByIdAndDelete(id);
  }

  async findOneWithStats(id: string) {
    const component = await this.componentModel
      .findById(id)
      .populate('accountId', 'userName avatar email')
      .lean();

    if (!component) return null;

    const favouritesCount = await this.favouriteModel.countDocuments({
      componentId: id,
    });

    const viewsCount = await this.viewModel.countDocuments({
      componentId: id,
    });

    return {
      ...component,
      favouritesCount,
      viewsCount,
    };
  }

  async findByStatus(status: string) {
    return this.componentModel.aggregate([
      { $match: { status } },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'componentId',
          as: 'views',
        },
      },
      {
        $lookup: {
          from: 'favourites',
          localField: '_id',
          foreignField: 'componentId',
          as: 'favourites',
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'authorDetails',
        },
      },
      { $unwind: '$authorDetails' },
      {
        $addFields: {
          viewsCount: { $size: '$views' },
          favouritesCount: { $size: '$favourites' },
          accountId: '$authorDetails',
        },
      },
      {
        $project: {
          views: 0,
          favourites: 0,
          authorDetails: 0,
        },
      },
    ]);
  }
}
