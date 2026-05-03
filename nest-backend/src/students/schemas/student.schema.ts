import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema()
export class Student {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  age!: string;

  @Prop()
  course!: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);