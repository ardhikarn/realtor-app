import { IsString, IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator'
export class SignupDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/, {
    message: "phone must be a valid phone number"
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}