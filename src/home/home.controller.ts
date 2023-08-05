import { Controller, Delete, Get, Post, Put, Query} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home.dto';
import { ProperType } from '@prisma/client';

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

    const price =  minPrice || maxPrice ? {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) })
    } : undefined

    const filters = {
      ...(city && { city }),
      ...(price && { price}),
      ...(propertyType && { propertyType })
    }

    return this.homeService.getHomes(filters)
  }

  @Get(':id')
  getHomeById() {
    return 'by id'
  }

  @Post()
  createHome() {
    return "create"
  }

  @Put(':id')
  updateHome() {
    return "update"
  }

  @Delete(':id')
  deleteHome() {
    return "delete"
  }
}
