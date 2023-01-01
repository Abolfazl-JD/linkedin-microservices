import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'apps/users/src/user.entity';
import { Repository } from 'typeorm';
import { CreateFeedDto } from './dtos/create-feed.dto';
import { GetFeedsDto } from './dtos/get-feeds.dto';
import { Feed } from './feed.entity';

@Injectable()
export class FeedsService {

  constructor(@InjectRepository(Feed) private feedsRepository: Repository<Feed>){}
  
  createFeed(user: User, feedInfo: CreateFeedDto) {
    const newFeed = this.feedsRepository.create(feedInfo)
    newFeed.author = user
    return this.feedsRepository.save(newFeed)
  }

  findFeeds(getFeedsDto: GetFeedsDto) {
    const { skip = 0, take = 10 } = getFeedsDto
    console.log(skip, take)
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
    return this.feedsRepository.save({ ...feed, body })
  }

  async deleteFeed(id: number){
    const feed = await this.findOneFeed(id)
    this.feedsRepository.remove(feed)
    return 'feed was successfully deleted'
  }
}
