import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ name, phone, email, password }: SignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })
    if (userExists) throw new ConflictException
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: UserType.BUYER
      }
    })

    const token = await jwt.sign({
      name,
      id: user.id
    }, process.env.JWT_SECRET_KEY, {
      expiresIn: 3600000
    })

    return {token}
  }
}
