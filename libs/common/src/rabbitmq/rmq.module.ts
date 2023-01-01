import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transport } from "@nestjs/microservices";
import { ClientsModule } from "@nestjs/microservices/module";
import { RmqService } from "./rmq.service";

interface RmqModuleOptions {
    name: string
    queue: string
}

@Module({
    providers: [RmqService],
    exports: [RmqService]
})
export class RmqModule {
    static register({ name, queue }: RmqModuleOptions): DynamicModule {
        return {
            module: RmqModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name,
                        useFactory: (configService: ConfigService) => ({
                            transport: Transport.RMQ,
                            options: {
                                urls: [configService.get<string>('RABBIT_MQ_URL')],
                                queue : configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`)
                            }
                        }),
                        inject: [ConfigService]
                    }
                ])
            ],
            exports: [ClientsModule]
        }
    }
}