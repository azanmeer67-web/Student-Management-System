import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  // 1. CREATE: Save a new student
  async create(createStudentDto: any): Promise<Student> {
    const newStudent = new this.studentModel(createStudentDto);
    return await newStudent.save();
  }

  // 2. READ ALL: Get all students
  async findAll(): Promise<Student[]> {
    return await this.studentModel.find().exec();
  }

  // 3. READ ONE: Get a single student by ID
  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  // 4. UPDATE: Update a student's data by ID
  async update(id: string, updateStudentDto: any): Promise<Student> {
    const existingStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return existingStudent;
  }

  // 5. DELETE: Remove a student by ID
  async remove(id: string): Promise<any> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return { message: `Student with ID ${id} deleted successfully` };
  }
}