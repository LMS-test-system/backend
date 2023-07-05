import { Module, forwardRef } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Result } from './models/result.model';
import { StudentModule } from '../student/student.module';
import { TestModule } from '../test/test.module';
import { ResultQuestion } from '../result_question/models/result_question.model';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Result, ResultQuestion]),
    forwardRef(() => StudentModule),
    forwardRef(() => TestModule),
    forwardRef(() => QuestionModule),
  ],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}
