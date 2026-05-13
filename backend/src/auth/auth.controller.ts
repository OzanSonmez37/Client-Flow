import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  register(@Body() dto: RegisterDto, @Request() req) {
    return this.authService.register(dto, req.user);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  getUsers() {
    return this.authService.getUsers();
  }
}
