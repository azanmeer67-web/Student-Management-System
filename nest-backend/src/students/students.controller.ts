import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StudentsService } from './students.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // New Scan Endpoint: POST http://localhost:3001/api/students/scan
  @Post('scan')
  @UseInterceptors(FileInterceptor('cardImage'))
  async scanCard(@UploadedFile() file: any) {
    return this.studentsService.scanAndVerifyCard(file.buffer);
  }

  @Post()
  create(@Body() createStudentDto: any) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }
}