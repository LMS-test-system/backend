import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { GroupSubjectService } from './group-subject.service';
import { CreateGroupSubjectDto } from './dto/create-group-subject.dto';

@Controller('group-subject')
export class GroupSubjectController {
  constructor(private readonly groupSubjectService: GroupSubjectService) {}

  @Post()
  async create(
    @Body() createGroupSubjectDto: CreateGroupSubjectDto,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.groupSubjectService.create(createGroupSubjectDto, authHeader);
  }

  @Get()
  async findAll(@Headers('Authorization') authHeader: string) {
    return this.groupSubjectService.findAll(authHeader);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.groupSubjectService.findOne(id, authHeader);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.groupSubjectService.remove(id, authHeader);
  }
}
