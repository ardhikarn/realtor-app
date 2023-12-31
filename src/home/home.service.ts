import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { ProperType } from '@prisma/client';
import { User } from 'src/user/decoratos/user.decorator';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: ProperType;
}

interface CreateHomeParam {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: ProperType;
  images: {
    url: string;
  }[];
}

interface UpdateHomeParam {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: ProperType;
}

const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bedrooms: true,
  number_of_bathrooms: true,
  listed_date: true,
  land_size: true,
};
@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map((home) => {
      const newHome = { ...home, image: home.images[0].url };
      delete newHome.images;
      return new HomeResponseDto(newHome);
    });
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) throw new NotFoundException();

    return new HomeResponseDto(home);
  }

  async createHome({
    address,
    numberOfBathrooms,
    numberOfBedrooms,
    city,
    price,
    landSize,
    images,
    propertyType,
  }: CreateHomeParam, userId: number) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        price,
        propertyType,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, data: UpdateHomeParam) {
    const newData = {
      ...data,
      ...(data.landSize && { land_size: data.landSize }),
      ...(data.numberOfBathrooms && {
        number_of_bathrooms: data.numberOfBathrooms,
      }),
      ...(data.numberOfBedrooms && {
        number_of_bedrooms: data.numberOfBedrooms,
      }),
    };

    if (newData.landSize) delete newData.landSize;
    if (newData.numberOfBathrooms) delete newData.numberOfBathrooms;
    if (newData.numberOfBedrooms) delete newData.numberOfBedrooms;

    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data: newData,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    await this.prismaService.image.deleteMany({
      where: {
        home_id: id
      }
    })

    await this.prismaService.home.delete({
      where: { id },
    });

    return (await this.prismaService.home.findMany()).map(v => {
      return new HomeResponseDto(v)
    })
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id
      },
      select: {
        realtor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!home) throw new NotFoundException()

    return home.realtor.id;
  }

  async inquire(user: User, homeId: number, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);
    
    return this.prismaService.message.create({
      data: {
        message,
        home_id: homeId,
        buyer_id: user.id,
        realtor_id: realtor
      }
    })
  }

  async getMessagesByHome(homeId: number) {
    return this.prismaService.message.findMany({
      where: {
        home_id: homeId
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          }
        }
      }
    })
  }
}
