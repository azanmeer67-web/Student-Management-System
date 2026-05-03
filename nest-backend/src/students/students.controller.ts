import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('api/students') // This makes your URL: http://localhost:3001/api/students
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: any) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}