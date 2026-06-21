import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  // New Card Scanning & Verification Feature
  async scanAndVerifyCard(fileBuffer: Buffer): Promise<Student> {
    try {
      // 1. Run Optical Character Recognition (OCR) to extract text from the card image
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
      
      const cleanText = text.toLowerCase();

      // 2. STRICT GATEKEEPER: Restrict exclusively to UMT students
      const isUMT = cleanText.includes('umt') || cleanText.includes('management and technology');
      if (!isUMT) {
        throw new BadRequestException('Access Denied: Invalid student card. This application is strictly restricted to UMT assets.');
      }

      // 3. INFORMATION EXTRACTION VIA REGEX MATCHING
      // Extract Participant ID / Roll Number (e.g., F2022332012 or 22-11111-222)
      const rollNoRegex = /(?:participant id|roll no|id:?)\s*([a-z0-9-]+)/i;
      const rollNoMatch = text.match(rollNoRegex);
      const rollNumber = rollNoMatch ? rollNoMatch[1].trim() : 'UNKNOWN_ROLL';

      // Extract Name (Grabs lines following the "Name:" indicator)
      const nameRegex = /(?:name:?)\s*([^\n\r]+)/i;
      const nameMatch = text.match(nameRegex);
      const extractedName = nameMatch ? nameMatch[1].trim() : 'Extracted UMT Student';

      // Extract Program / Department (e.g., BS Computer Science)
      const programRegex = /(?:program|department|course:?)\s*([^\n\r]+)/i;
      const programMatch = text.match(programRegex);
      const extractedCourse = programMatch ? programMatch[1].trim() : 'UMT Program';

      // 4. GENERATE SYSTEM EMAIL AUTOMATICALLY
      // UMT format: rollnumber@umt.edu.pk
      const generatedEmail = `${rollNumber.toLowerCase()}@umt.edu.pk`;

      // Check if student is already in the database
      const existingStudent = await this.studentModel.findOne({ email: generatedEmail }).exec();
      if (existingStudent) {
        return existingStudent; // Return existing profile if already scanned before
      }

      // 5. AUTOMATICALLY ATTEMPT TO SAVE TO MONGODB VIA MONGOOSE
      const newStudent = new this.studentModel({
        name: extractedName,
        email: generatedEmail,
        age: 20, // Default baseline enrollment age
        course: extractedCourse
      });

      return await newStudent.save();
    } catch (err) {
      throw new BadRequestException(err.message || 'Failed to process card image.');
    }
  }

  // Keep your existing CRUD actions below unchanged...
  async create(createStudentDto: any): Promise<Student> {
    const newStudent = new this.studentModel(createStudentDto);
    return await newStudent.save();
  }

  async findAll(): Promise<Student[]> {
    return await this.studentModel.find().exec();
  }
}