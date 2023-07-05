import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Result } from './models/result.model';
import { v4 as uuid } from 'uuid';
import { StudentService } from '../student/student.service';
import { TestService } from '../test/test.service';
import { Student } from '../student/models/student.model';
import { Test } from '../test/models/test.model';
import { ResultQuestion } from '../result_question/models/result_question.model';
import { CheckResultDto } from './dto/check-result.dto';
import { ResultQuestionService } from './../result_question/result_question.service';
import { QuestionService } from './../question/question.service';
import { Image } from '../image/models/image.model';
import { ResultAnswer } from '../result_answer/models/result_answer.model';

@Injectable()
export class ResultService {
  constructor(
    @InjectModel(Result) private resultRepository: typeof Result,
    @InjectModel(ResultQuestion)
    private resultQuestionRepository: typeof ResultQuestion,
    private readonly studentService: StudentService,
    private readonly testService: TestService,
    private readonly questionService: QuestionService,
  ) {}

  async create(createResultDto: CreateResultDto) {
    const { student_id, test_id } = createResultDto;

    await this.studentService.getOne(student_id);
    await this.testService.getOne(test_id);
    await this.getResultByStudentId(student_id, test_id);

    const newResult = await this.resultRepository.create({
      id: uuid(),
      ...createResultDto,
    });
    return this.findOne(newResult.id);
  }

  async findAll() {
    return this.resultRepository.findAll({
      attributes: ['id', 'time_spent', 'createdAt', 'student_id', 'test_id'],
      include: [Student, Test, ResultQuestion],
    });
  }

  async findOne(id: string) {
    return this.getOne(id);
  }

  async remove(id: string) {
    const result = await this.getOne(id);
    await this.resultRepository.destroy({ where: { id } });
    return result;
  }

  async removeAll() {
    const result = await this.findAll();

    for (let res of result) {
      await this.remove(res.id);
    }

    return this.findAll();
  }

  async checkResult(checkResultDto: CheckResultDto) {
    const { student_id, test_id } = checkResultDto;

    await this.studentService.getOne(student_id);
    await this.testService.getOne(test_id);

    return this.getResultByStudentId(student_id, test_id);
  }

  async calculateResult(id: string) {
    const result = await this.getOne(id);

    for (let i in result.resultQuestion) {
      const question = await this.questionService.getOne(
        result.resultQuestion[i].question_id,
      );

      let is_right = true;

      const right_answer = question.answer
        .filter((el) => el.is_right)
        .map((el) => el.id);

      const selected_answer = result.resultQuestion[i].resultAnswer.map(
        (el) => el.answer_id,
      );

      right_answer.forEach((el) => {
        if (!selected_answer.includes(el)) {
          is_right = false;
          return;
        }
      });

      selected_answer.forEach((el) => {
        if (!right_answer.includes(el)) {
          is_right = false;
          return;
        }
      });

      await this.resultQuestionRepository.update(
        { is_right },
        { where: { id: result.resultQuestion[i].id } },
      );
    }

    return { success: true };
  }

  async getOne(id: string) {
    const result = await this.resultRepository.findOne({
      where: { id },
      attributes: ['id', 'time_spent', 'createdAt', 'student_id', 'test_id'],
      include: [
        {
          model: Student,
          attributes: ['id', 'full_name', 'image_id'],
          include: [
            {
              model: Image,
              attributes: ['id', 'file_name'],
            },
          ],
        },
        {
          model: Test,
          attributes: [
            'id',
            'name',
            'type',
            'time_limit',
            'createdAt',
            'subject_id',
          ],
        },
        {
          model: ResultQuestion,
          attributes: ['id', 'is_right', 'result_id', 'question_id'],
          include: [
            {
              model: ResultAnswer,
              attributes: ['id', 'result_question_id', 'answer_id'],
            },
          ],
        },
      ],
    });
    if (!result) {
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async getResultByStudentId(student_id: string, test_id: string) {
    const result = await this.resultRepository.findOne({
      where: { student_id, test_id },
      attributes: ['id', 'time_spent', 'createdAt', 'student_id', 'test_id'],
    });
    if (result) {
      throw new BadRequestException('Reached to Limit!');
    }
    return { check: true };
  }
}
