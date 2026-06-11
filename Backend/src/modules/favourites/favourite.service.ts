import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favourite } from './favourite.schema';
import { UserPointsService } from '../Points/point.service';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectModel(Favourite.name)
    private readonly favouriteModel: Model<Favourite>,
    private readonly pointsService: UserPointsService,
  ) {}

  async addToFavourites(
    accountId: string,
    componentId: string,
  ): Promise<Favourite> {
    const existing = await this.favouriteModel.findOne({
      accountId,
      componentId,
    });
    if (existing) {
      throw new ConflictException('Component already in favourites');
    }

    const favourite = new this.favouriteModel({
      accountId,
      componentId,
    });
    return favourite.save();
  }

  async removeFromFavourites(
    accountId: string,
    componentId: string,
  ): Promise<void> {
    const result = await this.favouriteModel.deleteOne({
      accountId,
      componentId,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Favourite not found');
    }
  }

  async toggleFavourite(
    accountId: string,
    componentId: string,
  ): Promise<{ isFavourite: boolean; message: string }> {
    const existing = await this.favouriteModel.findOne({
      accountId,
      componentId,
    });

    if (!existing) {
      await this.favouriteModel.create({ accountId, componentId });

      await this.pointsService.addPoint(
        accountId,
        componentId,
        'favourite',
        +2,
      );

      return { isFavourite: true, message: 'Added' };
    }

    await this.favouriteModel.deleteOne({ accountId, componentId });

    await this.pointsService.addPoint(
      accountId,
      componentId,
      'unfavourite',
      -2,
    );

    return { isFavourite: false, message: 'Removed' };
  }

  async getFavouritesByAccount(accountId: string): Promise<Favourite[]> {
    return this.favouriteModel
      .find({ accountId })
      .populate({
        path: 'componentId',
        populate: { path: 'accountId', select: 'username fullName avatar' },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async isFavourite(accountId: string, componentId: string): Promise<boolean> {
    const favourite = await this.favouriteModel.findOne({
      accountId,
      componentId,
    });
    return !!favourite;
  }

  async getFavouriteComponentIds(accountId: string): Promise<string[]> {
    const favourites = await this.favouriteModel
      .find({ accountId })
      .select('componentId')
      .exec();
    return favourites.map((f) => f.componentId);
  }

  async countFavouritesByComponent(componentId: string): Promise<number> {
    return this.favouriteModel.countDocuments({ componentId });
  }

  async getCountByComponent(componentId: string): Promise<number> {
    return this.favouriteModel.countDocuments({ componentId }).exec();
  }

  async findAll(): Promise<Favourite[]> {
    return this.favouriteModel.find().exec();
  }

  async findOne(id: string): Promise<Favourite | null> {
    return this.favouriteModel.findById(id).exec();
  }

  async update(
    id: string,
    updateData: Partial<any>,
  ): Promise<Favourite | null> {
    return this.favouriteModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Favourite | null> {
    return this.favouriteModel.findByIdAndDelete(id).exec();
  }

  async getFavouritesWithStats(accountId: string) {
    return this.favouriteModel.aggregate([
      { $match: { accountId: accountId } },

      {
        $lookup: {
          from: 'components',
          localField: 'componentId',
          foreignField: '_id',
          as: 'component',
        },
      },
      { $unwind: '$component' },

      {
        $lookup: {
          from: 'accounts',
          localField: 'component.accountId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'views',
          localField: 'component._id',
          foreignField: 'componentId',
          as: 'views',
        },
      },

      {
        $lookup: {
          from: 'favourites',
          localField: 'component._id',
          foreignField: 'componentId',
          as: 'favourites',
        },
      },

      {
        $addFields: {
          viewsCount: { $size: '$views' },
          favouritesCount: { $size: '$favourites' },
        },
      },

      {
        $project: {
          _id: '$component._id',
          title: '$component.title',
          htmlCode: '$component.htmlCode',
          cssCode: '$component.cssCode',
          accountId: {
            username: '$author.userName',
            fullName: '$author.fullName',
            avatar: '$author.avatar',
          },
          viewsCount: 1,
          favouritesCount: 1,
        },
      },
    ]);
  }
}
