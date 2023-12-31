import { Module, forwardRef } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Student } from './models/student.model';
import { ImageModule } from '../image/image.module';
import { GroupModule } from '../group/group.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Student]),
    forwardRef(() => ImageModule),
    forwardRef(() => GroupModule),
    forwardRef(() => RoleModule),
    JwtModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
