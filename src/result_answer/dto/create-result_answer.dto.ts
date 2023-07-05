import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResultAnswerDto {
  @IsNotEmpty()
  @IsString()
  result_question_id: string;

  answer_id: string;
}
