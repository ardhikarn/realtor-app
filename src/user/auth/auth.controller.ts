import { Controller, Post, Body, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signup(@Body() body: SignupDto, @Param('userType') userType: UserType) {
    const userTypeUpper = userType.toUpperCase() as UserType
    if(userTypeUpper !== UserType.BUYER) {
      if(!body.productKey) {
        throw new UnauthorizedException()
      }

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_SECRET_KEY}`;
      const isValidProductKey = await bcrypt.compare(validProductKey, body.productKey )

      if(!isValidProductKey) {
        throw new UnauthorizedException()
      }
    }
    return this.authService.signup(body, userTypeUpper);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }
}
