import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(200)
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(200)
  currentPassword!: string;

  @IsString()
  @MinLength(10, {
    message: 'La contraseña nueva tiene que tener al menos 10 caracteres.',
  })
  @MaxLength(200)
  newPassword!: string;
}
