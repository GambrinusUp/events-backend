import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
