import {
  ConflictException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import { AuthResponseDto } from '../dtos/auth.dto';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(
    { name, phone, email, password }: SignupParams,
    userType: UserType,
  ): Promise<AuthResponseDto> {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) throw new ConflictException(
      'Email already exists. Please use another email',
    );
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: userType,
      },
    });

    const token = await this.generateJwt(name, user.id);

    const result = {
      code: HttpStatus.CREATED,
      status: 'success',
      message: 'Signup successful',
      data: {
        userId: user.id,
        name: user.name,
        type: userType,
        token: token,
      },
    };
    return new AuthResponseDto(result);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) throw new HttpException('Invalid Credentials', 400);

    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) throw new HttpException('Invalid Credentials', 400);

    const token = await this.generateJwt(user.name, user.id);

    const result = {
      code: HttpStatus.OK,
      status: 'success',
      message: 'Signin successful',
      data: {
        userId: user.id,
        name: user.name,
        type: user.user_type,
        token: token,
      },
    };

    return new AuthResponseDto(result); 
  }

  private generateJwt(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: 3600000,
      },
    );
  }

  generateProductKey(email: string, userType: UserType) {
    const key = `${email}-${userType.toLowerCase()}-${
      process.env.PRODUCT_SECRET_KEY
    }`;
    return bcrypt.hash(key, 10);
  }

  logout() {
    return {
      code: HttpStatus.OK,
      status: 'success',
      message: 'Logout successful',
    };
  }
}
