import { AuthorizationGuard, AuthorizedReq, EmailConfirmationGuard } from '@app/common';
import { Body, CacheKey, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../interceptors/http-cache.interceptor';
import { GET_FEEDS_CACHE_KEY } from './constants/cache-feeds.constant';
import { CreateFeedDto } from './dtos/create-feed.dto';
import { GetFeedsDto } from './dtos/get-feeds.dto';
import { FeedsService } from './feeds.service';
import { UpdateFeedGuard } from './guards/update-feed.guard';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
  @Post()
  createFeed(@Body() feedDetails: CreateFeedDto, @Req() req: AuthorizedReq) {
    return this.feedsService.createFeed(req.user, feedDetails)
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_FEEDS_CACHE_KEY)
  @Get()
  getFeeds(@Query() getFeedsDto: GetFeedsDto) {
    return this.feedsService.findFeeds(getFeedsDto)
  }

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard, UpdateFeedGuard)
  @Patch(':id')
  updateFeed(@Body() feedDetails: CreateFeedDto, @Param('id') id: number) {
    return this.feedsService.updateFeed(id, feedDetails.body)
  }

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard, UpdateFeedGuard)
  @Delete(':id')
  deleteFeed(@Param('id') id: number) {
    return this.feedsService.deleteFeed(id)
  }
}
