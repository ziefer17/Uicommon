import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get('weekly')
  getWeekly() {
    return this.service.getWeeklyTopElements();
  }

  @Get('creators')
  getCreators() {
    return this.service.getTopCreators();
  }

  // ✔ TOP USERS BY VIEWS
  @Get('top-users-views')
  getTopUsersByViews() {
    return this.service.getTopUsersByViews();
  }

  // ✔ TOP USERS BY FAVORITES
  @Get('top-users-fav')
  getTopUsersByFavorites() {
    return this.service.getTopUsersByFavorites();
  }
}
