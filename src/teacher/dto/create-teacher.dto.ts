import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  telegram: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  role_id: string;
}
