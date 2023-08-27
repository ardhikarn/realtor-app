import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // getClass() returns the class of the handler
    // getHandler() returns the handler function itself

    const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (roles?.length) {
      const req = ctx.switchToHttp().getRequest();
      const token = req?.headers?.authorization?.split('Bearer ')[1];
      try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await this.prismaService.user.findUnique({
          where: {
            id: (payload as JwtPayload).id,
          },
        });
        if (!user) throw new ForbiddenException('Access denied');
        if (roles.includes(user.user_type)) return true;
        throw new ForbiddenException('Access denied');
      } catch (err) {
        throw new ForbiddenException('Access denied');
      }
    }
    throw new ForbiddenException('Access denied');
  }
}
