import { Module, forwardRef } from '@nestjs/common';
import { GroupSubjectService } from './group-subject.service';
import { GroupSubjectController } from './group-subject.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupSubject } from './models/group-subject.model';
import { GroupModule } from '../group/group.module';
import { SubjectModule } from '../subject/subject.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([GroupSubject]),
    forwardRef(() => GroupModule),
    forwardRef(() => SubjectModule),
    JwtModule,
  ],
  controllers: [GroupSubjectController],
  providers: [GroupSubjectService],
  exports: [GroupSubjectService],
})
export class GroupSubjectModule {}
