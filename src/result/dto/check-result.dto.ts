import { IsNotEmpty, IsString } from 'class-validator';

export class CheckResultDto {
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @IsNotEmpty()
  @IsString()
  test_id: string;
}
