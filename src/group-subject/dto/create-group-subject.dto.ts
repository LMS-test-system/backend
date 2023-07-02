import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupSubjectDto {
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @IsNotEmpty()
  @IsString()
  subject_id: string;
}
