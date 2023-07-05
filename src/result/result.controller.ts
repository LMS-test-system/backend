import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { CheckResultDto } from './dto/check-result.dto';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  async create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get()
  async findAll() {
    return this.resultService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.resultService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.resultService.remove(id);
  }

  @Post('/check')
  async checkResult(@Body() checkResultDto: CheckResultDto) {
    return this.resultService.checkResult(checkResultDto);
  }

  @Get('/calculate/:id')
  async calculateResult(@Param('id') id: string) {
    return this.resultService.calculateResult(id);
  }

  @Delete('/all')
  async removeAll() {
    return this.resultService.removeAll();
  }
}
