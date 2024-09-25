import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GoogleService {
  constructor(private prisma: PrismaService) {}

  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async saveUserTokens(userId: string, tokens: any) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });
  }

  async addEventToCalendar(eventDetails: any, studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
      throw new Error('User does not have Google tokens.');
    }

    this.oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const tokenInfo = await this.oauth2Client.getTokenInfo(
      user.googleAccessToken,
    );
    const isExpiring =
      tokenInfo.expiry_date && Date.now() >= tokenInfo.expiry_date - 60000;

    if (isExpiring) {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      await this.prisma.user.update({
        where: { id: studentId },
        data: {
          googleAccessToken: credentials.access_token,
          googleRefreshToken: credentials.refresh_token,
        },
      });
    }

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventDetails.endDate,
        timeZone: 'UTC',
      },
    };

    console.log(event);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  async hasGoogleTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return !!user.googleAccessToken && !!user.googleRefreshToken;
  }
}
