import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateGroupSubjectDto } from './dto/create-group-subject.dto';
import { v4 as uuid } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { GroupSubject } from './models/group-subject.model';
import { Group } from '../group/models/group.model';
import { Subject } from '../subject/models/subject.model';
import { GroupService } from './../group/group.service';
import { SubjectService } from './../subject/subject.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GroupSubjectService {
  constructor(
    @InjectModel(GroupSubject)
    private groupSubjectRepository: typeof GroupSubject,
    private readonly groupService: GroupService,
    private readonly subjectService: SubjectService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createGroupSubjectDto: CreateGroupSubjectDto,
    authHeader: string,
  ) {
    await this.isSuperAdmin(authHeader);
    const { group_id, subject_id } = createGroupSubjectDto;
    await this.groupService.getOne(createGroupSubjectDto.group_id);
    await this.subjectService.getOne(createGroupSubjectDto.subject_id);
    const groupSubject = await this.groupSubjectRepository.findOne({
      where: { group_id, subject_id },
    });
    if (groupSubject) {
      throw new BadRequestException('Group already has this subject');
    }
    const newGroupSubject = await this.groupSubjectRepository.create({
      id: uuid(),
      ...createGroupSubjectDto,
    });
    return this.getOne(newGroupSubject.id);
  }

  async findAll(authHeader: string) {
    await this.isAdmin(authHeader);
    return this.groupSubjectRepository.findAll({
      attributes: ['id'],
      include: [Group, Subject],
    });
  }

  async findOne(id: string, authHeader: string) {
    await this.isAdmin(authHeader);
    const GroupSubject = await this.groupSubjectRepository.findOne({
      where: { id },
      attributes: ['id'],
      include: [Group, Subject],
    });
    if (!GroupSubject) {
      throw new HttpException('Group Subject not found', HttpStatus.NOT_FOUND);
    }
    return GroupSubject;
  }

  async remove(id: string, authHeader: string) {
    await this.isSuperAdmin(authHeader);
    const GroupSubject = await this.getOne(id);
    await this.groupSubjectRepository.destroy({ where: { id } });
    return GroupSubject;
  }

  async getOne(id: string) {
    const GroupSubject = await this.groupSubjectRepository.findOne({
      where: { id },
      attributes: ['id'],
      include: [Group, Subject],
    });
    if (!GroupSubject) {
      throw new HttpException('Group Subject not found', HttpStatus.NOT_FOUND);
    }
    return GroupSubject;
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
