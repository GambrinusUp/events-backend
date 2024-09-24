import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterResponse } from './dto/register-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  @ApiResponse({
    status: 404,
    description: 'Нет пользователя с таким email',
  })
  @ApiResponse({
    status: 401,
    description: 'Неправильный пароль',
  })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('register')
  @ApiOkResponse({ type: RegisterResponse })
  @ApiResponse({
    status: 400,
    description: 'Ошибка в данных',
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisterResponse> {
    return this.authService.register(createUserDto);
  }
}
