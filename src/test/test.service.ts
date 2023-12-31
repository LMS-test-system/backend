import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Test } from './models/test.model';
import { SubjectService } from '../subject/subject.service';
import { v4 as uuid } from 'uuid';
import { Subject } from '../subject/models/subject.model';
import { Question } from '../question/models/question.model';
import { JwtService } from '@nestjs/jwt';
import { Image } from '../image/models/image.model';
import { Answer } from '../answer/models/answer.model';
import { Result } from '../result/models/result.model';
import { Student } from '../student/models/student.model';
import { ResultQuestion } from '../result_question/models/result_question.model';
import { ResultAnswer } from '../result_answer/models/result_answer.model';
import { GroupSubject } from '../group-subject/models/group-subject.model';
import { Group } from '../group/models/group.model';

@Injectable()
export class TestService {
  private role: string;
  private answerAttrs: string[];

  constructor(
    @InjectModel(Test) private testRepository: typeof Test,
    private readonly subjectService: SubjectService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createTestDto: CreateTestDto, authHeader: string) {
    await this.isTeacher(authHeader);
    await this.subjectService.getOne(createTestDto.subject_id);
    const newTest = await this.testRepository.create({
      id: uuid(),
      ...createTestDto,
    });
    return this.getOne(newTest.id);
  }

  async findAll(authHeader: string) {
    return this.testRepository.findAll({
      order: [
        [{ model: Question, as: 'question' }, 'createdAt', 'ASC'],
        [
          { model: Question, as: 'question' },
          { model: Answer, as: 'answer' },
          'createdAt',
          'ASC',
        ],
      ],
      attributes: [
        'id',
        'name',
        'type',
        'time_limit',
        'createdAt',
        'subject_id',
      ],
      include: [
        {
          model: Subject,
          attributes: ['id', 'name', 'image_id'],
          include: [
            {
              model: Image,
              attributes: ['id', 'file_name'],
            },
          ],
        },
        {
          model: Question,
          attributes: ['id', 'question', 'is_multiple_answer', 'test_id'],
          include: [
            {
              model: Answer,
              attributes: ['id', 'answer', 'question_id'],
            },
          ],
        },
      ],
    });
  }

  async findOne(id: string, authHeader: string) {
    await this.verifyAccessToken(authHeader);
    await this.checkRole();
    const test = await this.getOne(id);
    if (this.role == 'student') {
      await this.shuffle(test.question);

      test.question.forEach(async (el) => {
        await this.shuffle(el.answer);
      });

      const arr = [[1], [2], [3]];
      await this.shuffle(arr);
      console.log(arr);
    }

    return test;
  }

  async update(id: string, updateTestDto: UpdateTestDto, authHeader: string) {
    await this.isTeacher(authHeader);
    await this.getOne(id);
    if (updateTestDto.subject_id) {
      await this.subjectService.getOne(updateTestDto.subject_id);
    }
    await this.testRepository.update(updateTestDto, { where: { id } });
    return this.getOne(id);
  }

  async remove(id: string, authHeader: string) {
    await this.isTeacher(authHeader);
    const test = await this.getOne(id);
    await this.testRepository.destroy({ where: { id } });
    return test;
  }

  async getOne(id: string) {
    const test = await this.testRepository.findOne({
      order: [
        [{ model: Question, as: 'question' }, 'createdAt', 'ASC'],
        [
          { model: Question, as: 'question' },
          { model: Answer, as: 'answer' },
          'createdAt',
          'ASC',
        ],
      ],
      where: { id },
      attributes: [
        'id',
        'name',
        'type',
        'time_limit',
        'createdAt',
        'subject_id',
      ],
      include: [
        {
          model: Subject,
          attributes: ['id', 'name', 'image_id'],
          include: [
            {
              model: Image,
              attributes: ['id', 'file_name'],
            },
            {
              model: GroupSubject,
              attributes: ['id'],
              include: [
                {
                  model: Group,
                  attributes: ['id', 'name', 'image_id'],
                  include: [
                    {
                      model: Image,
                      attributes: ['id', 'file_name'],
                    },
                    {
                      model: Student,
                      attributes: ['id', 'full_name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Question,
          attributes: ['id', 'question', 'is_multiple_answer', 'test_id'],
          include: [
            {
              model: Answer,
              attributes: this.answerAttrs,
            },
          ],
        },
        {
          model: Result,
          attributes: [
            'id',
            'time_spent',
            'createdAt',
            'student_id',
            'test_id',
          ],
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
              model: ResultQuestion,
              attributes: ['id', 'is_right', 'result_id', 'question_id'],
              include: [
                {
                  model: Question,
                  attributes: [
                    'id',
                    'question',
                    'is_multiple_answer',
                    'test_id',
                  ],
                },
                {
                  model: ResultAnswer,
                  attributes: ['id', 'result_question_id', 'answer_id'],
                  include: [
                    {
                      model: Answer,
                      attributes: ['id', 'answer', 'question_id'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!test) {
      throw new HttpException('Test not found', HttpStatus.NOT_FOUND);
    }
    return test;
  }

  async verifyAccessToken(authHeader: string) {
    try {
      const access_token = authHeader.split(' ')[1];
      const user = await this.jwtService.verify(access_token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
      this.role = user.role;
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async isSuperAdmin(authHeader: string) {
    const user = await this.verifyAccessToken(authHeader);
    if (user.role !== 'super-admin') {
      throw new UnauthorizedException('Restricted action');
    }
  }

  async isAdmin(authHeader: string) {
    const user = await this.verifyAccessToken(authHeader);
    if (user.role !== 'super-admin' && user.role !== 'admin') {
      throw new UnauthorizedException('Restricted action');
    }
  }

  async isTeacher(authHeader: string) {
    const user = await this.verifyAccessToken(authHeader);
    if (
      user.role !== 'super-admin' &&
      user.role !== 'admin' &&
      user.role !== 'teacher'
    ) {
      throw new UnauthorizedException('Restricted action');
    }
  }

  async checkRole() {
    this.answerAttrs =
      this.role !== 'student'
        ? ['id', 'answer', 'is_right', 'question_id']
        : ['id', 'answer', 'question_id'];
  }

  async shuffle(array: object[]) {
    var m = array.length,
      t,
      i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }
}
