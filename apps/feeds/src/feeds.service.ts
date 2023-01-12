import { CACHE_MANAGER, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/src/user.entity';
import { Repository } from 'typeorm';
import { CreateFeedDto } from './dtos/create-feed.dto';
import { GetFeedsDto } from './dtos/get-feeds.dto';
import { Feed } from './feed.entity';
import { Cache } from 'cache-manager'
import { GET_FEEDS_CACHE_KEY } from './constants/cache-feeds.constant';

@Injectable()
export class FeedsService {

  constructor(
    @InjectRepository(Feed) private feedsRepository: Repository<Feed>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }
  
  async createFeed(user: User, feedInfo: CreateFeedDto) {
    const newFeed = this.feedsRepository.create(feedInfo)
    newFeed.author = user
    const savedNewFeed = await this.feedsRepository.save(newFeed)
    await this.clearCache()
    return savedNewFeed
  }

  async findFeeds(getFeedsDto: GetFeedsDto) {
    const { skip = 0, take = 10 } = getFeedsDto
    console.log('get-feeds-cache-key', await this.cacheManager.get(GET_FEEDS_CACHE_KEY))
    return this.feedsRepository.find({
      relations: { author: true },
      skip,
      take
    })
  }

  async findOneFeed(id: number) {
    const feed = await this.feedsRepository.findOne({
      where: { id },
      relations : { author: true }
    })
    if (!feed) throw new NotFoundException('feed not found')
    return feed
  }

  async updateFeed(id: number, body: string) {
    const feed = await this.findOneFeed(id)
    const updatedFeed = await this.feedsRepository.save({ ...feed, body })
    await this.clearCache()
    return updatedFeed
  }

  async deleteFeed(id: number){
    const feed = await this.findOneFeed(id)
    await this.feedsRepository.remove(feed)
    await this.clearCache()
    return 'feed was successfully deleted'
  }

  async clearCache() {
    const keys: string[] = await this.cacheManager.store.keys()
    console.log('cache keys are : ', keys)
    for (const key of keys) {
      if(key.startsWith(GET_FEEDS_CACHE_KEY)) this.cacheManager.del(key)
    }
  }
}
