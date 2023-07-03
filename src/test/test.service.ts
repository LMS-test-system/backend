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
  constructor(
    @InjectModel(Test) private testRepository: typeof Test,
    private readonly subjectService: SubjectService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createTestDto: CreateTestDto, authHeader: string) {
    await this.isSuperAdmin(authHeader);
    await this.subjectService.getOne(createTestDto.subject_id);
    const newTest = await this.testRepository.create({
      id: uuid(),
      ...createTestDto,
    });
    return this.getOne(newTest.id);
  }

  async findAll(authHeader: string) {
    // await this.isAdmin(authHeader);
    return this.testRepository.findAll({
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
              attributes: ['id', 'answer', 'is_right', 'question_id'],
            },
          ],
        },
      ],
    });
  }

  async findOne(id: string, authHeader: string) {
    // await this.isAdmin(authHeader);
    return this.getOne(id);
  }

  async update(id: string, updateTestDto: UpdateTestDto, authHeader: string) {
    await this.isSuperAdmin(authHeader);
    await this.getOne(id);
    if (updateTestDto.subject_id) {
      await this.subjectService.getOne(updateTestDto.subject_id);
    }
    await this.testRepository.update(updateTestDto, { where: { id } });
    return this.getOne(id);
  }

  async remove(id: string, authHeader: string) {
    await this.isSuperAdmin(authHeader);
    const test = await this.getOne(id);
    await this.testRepository.destroy({ where: { id } });
    return test;
  }

  async getOne(id: string) {
    const test = await this.testRepository.findOne({
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
              attributes: ['id', 'answer', 'is_right', 'question_id'],
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
                      attributes: ['id', 'answer', 'is_right', 'question_id'],
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
}
