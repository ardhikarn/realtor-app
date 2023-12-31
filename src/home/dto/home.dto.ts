import { ProperType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class HomeResponseDto {
  id: number;
  address: string;

  @Exclude()
  number_of_bedrooms: number;
  @Expose({
    name: 'numberOfBedrooms',
  })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @Exclude()
  number_of_bathrooms: number;
  @Expose({
    name: 'numberOfBathrooms',
  })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  city: string;

  @Exclude()
  listed_date: Date;
  @Expose({
    name: 'listedDate',
  })
  listedDate() {
    return this.listed_date;
  }

  price: number;

  @Exclude()
  land_size: number;
  @Expose({
    name: 'landSize',
  })
  landSize() {
    return this.land_size;
  }

  propertyType: ProperType;

  image: string;

  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsEnum(ProperType, { message: 'Value Property Type Not Valid' })
  propertyType: ProperType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

// export class UpdateHomeDto extends PartialType(CreateHomeDto) {}
// ini membuat semua field menjadi optional
export class UpdateHomeDto extends PartialType(CreateHomeDto) {}


export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}