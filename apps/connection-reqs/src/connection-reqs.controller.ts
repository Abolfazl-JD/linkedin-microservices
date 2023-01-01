import { AuthorizationGuard, AuthorizedReq, EmailConfirmationGuard, USERS_SERVICE } from '@app/common';
import { Body, Controller, Get, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ConnectionReqsService } from './connection-reqs.service';
import { UpdateConnectionDto } from './dtos/update-connection.dto';
import { CreateRequestGuard } from './gurads/create-request.guard';
import { updateConnectionStatusGuard } from './gurads/update-connection-status.guard';

@Controller('connection-requests')
export class ConnectionReqsController {
  constructor(
    private readonly connectionReqsService: ConnectionReqsService,
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy
    ) { }

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard, CreateRequestGuard)
  @Post('send/:id')
  createConnectionRequest(@Req() req: AuthorizedReq, @Param('id') id: number) {
    return this.connectionReqsService.sendConnectionReq(req.user, id)
  }

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
  @Get('recieved')
  getRecievedConnectionReqs(@Req() req: AuthorizedReq) {
    return this.connectionReqsService.findRecievedConnectionReqs(req.user.id)
  }
  
  @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
  @Get('friends')
  getUserFriends(@Req() req: AuthorizedReq) {
    return this.connectionReqsService.findUserFriends(req.user.id)
  }
  
  @UseGuards(AuthorizationGuard, EmailConfirmationGuard, CreateRequestGuard)
  @Get(':id')
  async getUserConnectionStatus(@Req() req: AuthorizedReq, @Param('id') id: number) {
    const reciever = await lastValueFrom(this.usersClient.send('find-user', { id }))
    console.log('reciever is: ',reciever)
    return this.connectionReqsService.getConnectionReqStatus(req.user, reciever)
  }
  

  @UseGuards(AuthorizationGuard, EmailConfirmationGuard, updateConnectionStatusGuard)
  @Put(':connectionReqId')
  updateConnectionStatus(
    @Param('connectionReqId') connectionReqId: number,
    @Body() updateConnectionDto: UpdateConnectionDto
  ) {
    return this.connectionReqsService.updateConnectionReqStatus(connectionReqId, updateConnectionDto.status)
  }

  @MessagePattern('get-friends')
  handleGettingFriends(@Payload() data: { userId: number }) {
    console.log('message get-friends was successfully recieved')
    return this.connectionReqsService.findUserFriends(data.userId)
  }

}
