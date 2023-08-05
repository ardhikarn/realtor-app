import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('home')
export class HomeController {
  @Get()
  getHomes() {
    return []
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
