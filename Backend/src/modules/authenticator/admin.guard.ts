import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

interface JwtRequest extends Request {
  user?: { _id: string; email: string; role: string };
}

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 🟢 Chờ JwtAuthGuard xử lý token xong
    const can = await super.canActivate(context);
    if (!can) return false;

    const req = context.switchToHttp().getRequest<JwtRequest>();

    // 🧠 Đảm bảo req.user đã có dữ liệu
    if (!req.user) {
      throw new ForbiddenException('No user found.');
    }

    // 🧩 Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admins only.');
    }

    return true;
  }
}
