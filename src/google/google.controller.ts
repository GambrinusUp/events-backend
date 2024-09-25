import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleService } from './google.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as jwt from 'jsonwebtoken';

@ApiTags('google')
@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async googleAuth(@Res() res, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    const url = `${this.googleService.getAuthUrl()}&state=${token}`;
    return res.json({ url });
  }

  @Get('redirect')
  async googleRedirect(
    @Query('code') code: string,
    @Query('state') token: string,
    @Res() res,
  ) {
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(token);
    const decoded: any = jwt.decode(token);
    console.log(decoded);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const tokens = await this.googleService.getTokens(code);

    await this.googleService.saveUserTokens(userId, tokens);

    return res.redirect('http://localhost:5173');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('check-tokens')
  async checkGoogleTokens(@Req() req: Request, @Res() res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded: any = jwt.decode(token);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const hasTokens = await this.googleService.hasGoogleTokens(userId);

    return res.json({ hasTokens });
  }
}
