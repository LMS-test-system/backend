import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Headers,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Headers('Authorization') authHeader: string,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.subjectService.create(createSubjectDto,  authHeader, images);
  }

  @Get()
  async findAll(@Headers('Authorization') authHeader: string) {
    return this.subjectService.findAll(authHeader);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.subjectService.findOne(id, authHeader);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Headers('Authorization') authHeader: string,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.subjectService.update(id, updateSubjectDto,  authHeader, images);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.subjectService.remove(id, authHeader);
  }
}
