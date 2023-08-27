import { SetMetadata, createParamDecorator } from '@nestjs/common';

export const MyControllerMetadata = (...value: string[]) => SetMetadata('contohGetClass', value);