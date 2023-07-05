import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateResultQuestionDto {
  @IsNotEmpty()
  @IsString()
  result_id: string;

  @IsNotEmpty()
  @IsString()
  question_id: string;
}
