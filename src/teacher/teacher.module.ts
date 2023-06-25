import { Module, forwardRef } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Teacher } from './models/teacher.model';
import { ImageModule } from '../image/image.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Teacher]),
    forwardRef(() => ImageModule),
    forwardRef(() => RoleModule),
    JwtModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
