import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    // Railway uses DATABASE_URL, your laptop uses 127.0.0.1
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/student-management'),
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}