import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChallengeService } from './challenge.service';
import { AdminGuard } from '../authenticator/admin.guard';
import { ReviewerGuard } from '../authenticator/reviewer.guard';

interface AuthenticatedRequest extends Request {
  user?: { _id: string; email?: string; role: string };
}

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  // Public 

  @Get()
  async getAllChallenges() {
    return this.challengeService.getAllChallenges();
  }

  @Get('active')
  async getActiveChallenges() {
    return this.challengeService.getActiveChallenges();
  }

  @Get('previous')
  async getPreviousChallenges() {
    return this.challengeService.getPreviousChallenges();
  }

  @Get(':id')
  async getChallengeById(@Param('id') id: string) {
    return this.challengeService.getChallengeById(id);
  }

  @Get(':id/leaderboard')
  async getChallengeLeaderboard(@Param('id') id: string) {
    return this.challengeService.getChallengeLeaderboard(id);
  }

  @Get(':id/submissions')
  async getChallengeSubmissions(@Param('id') id: string) {
    return this.challengeService.getChallengeSubmissions(id);
  }

  // User 

  @UseGuards(AuthGuard('jwt'))
  @Post('submit')
  async submitToChallenge(
    @Req() req: AuthenticatedRequest,
    @Body() body: { challengeId: string; componentId: string },
  ) {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedException('User not found');

    return this.challengeService.submitToChallenge(body, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my/submissions')
  async getMySubmissions(@Req() req: AuthenticatedRequest) {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedException('User not found');

    return this.challengeService.getUserSubmissions(userId);
  }

  // ==================== REVIEWER/ADMIN ROUTES ====================

  @UseGuards(ReviewerGuard) // Only reviewer, moderator, or admin
  @Post('rate')
  async rateSubmission(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      submissionId: string;
      creativity: number;
      execution: number;
      adherence: number;
      feedback?: string;
    },
  ) {
    const reviewerId = req.user?._id;
    if (!reviewerId) throw new UnauthorizedException('User not found');

    return this.challengeService.rateSubmission(body, reviewerId);
  }

  @UseGuards(ReviewerGuard)
  @Get('submissions/:id/ratings')
  async getSubmissionRatings(@Param('id') id: string) {
    return this.challengeService.getSubmissionRatings(id);
  }

  // ==================== ADMIN ONLY ROUTES ====================

  @UseGuards(AdminGuard)
  @Post()
  async createChallenge(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      title: string;
      description: string;
      bannerImage: string;
      startDate: Date;
      endDate: Date;
      rules?: string[];
      allowedCategories: string[];
      firstPrize?: number;
      secondPrize?: number;
      thirdPrize?: number;
    },
  ) {
    const adminId = req.user?._id;
    if (!adminId) throw new UnauthorizedException('User not found');

    return this.challengeService.createChallenge(body, adminId);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async updateChallenge(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.challengeService.updateChallenge(id, body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteChallenge(@Param('id') id: string) {
    return this.challengeService.deleteChallenge(id);
  }

  @UseGuards(AdminGuard)
  @Post(':id/finalize')
  async finalizeChallenge(@Param('id') id: string) {
    return this.challengeService.finalizeChallenge(id);
  }
}
