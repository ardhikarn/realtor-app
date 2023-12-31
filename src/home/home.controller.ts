import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, InquireDto, UpdateHomeDto } from './dto/home.dto';
import { ProperType, UserType } from '@prisma/client';
import { User } from 'src/user/decoratos/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { MyControllerMetadata } from 'src/decorators/contoh.decorator';

@MyControllerMetadata('contoh ambil metadata dari getClass()')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: ProperType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: User): Promise<HomeResponseDto> {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: User
  ): Promise<HomeResponseDto> {
    const realtorId = await this.homeService.getRealtorByHomeId(id)
    if (realtorId !== user.id) {
      throw new UnauthorizedException()
    }
    return this.homeService.updateHome(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: User
  ): Promise<HomeResponseDto[]> {
    const realtorId = await this.homeService.getRealtorByHomeId(id)
    if (realtorId !== user.id) {
      throw new UnauthorizedException()
    }
    return this.homeService.deleteHome(id)
  }

  @Roles(UserType.BUYER)
  @Post('inquire/:id')
  inquire(
    @User() user: User,
    @Param('id', ParseIntPipe) homeId: number,
    @Body() { message }: InquireDto,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @Roles(UserType.REALTOR)
  @Get(':id/messages')
  async getHomeMessages(
    @User() user: User,
    @Param('id', ParseIntPipe) homeId: number,
  ) {
    const realtorId = await this.homeService.getRealtorByHomeId(homeId)
    if (realtorId !== user.id) {
      throw new UnauthorizedException()
    }
    return this.homeService.getMessagesByHome(homeId)
  }
} 