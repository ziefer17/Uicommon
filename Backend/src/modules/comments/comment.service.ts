import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: any): Promise<Comment | null> {
    const createdComment = new this.commentModel(createCommentDto);
    const saved = await createdComment.save();
    return this.commentModel
      .findById(saved._id)
      .populate('accountId', 'userName avatar')
      .exec();
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel
      .find()
      .populate('accountId', 'userName avatar')
      .exec();
  }

  async findByComponentId(componentId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ componentId })
      .populate('accountId', 'userName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.commentModel
      .findById(id)
      .populate('accountId', 'userName avatar')
      .exec();
  }

  async update(id: string, updateData: Partial<any>): Promise<Comment | null> {
    return this.commentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('accountId', 'userName avatar')
      .exec();
  }

  async remove(id: string): Promise<Comment | null> {
    return this.commentModel.findByIdAndDelete(id).exec();
  }
}
