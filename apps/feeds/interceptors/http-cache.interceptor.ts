import { CacheInterceptor, CACHE_KEY_METADATA, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    protected trackBy(context: ExecutionContext): string {
        const cacheKey = this.reflector.get(
            CACHE_KEY_METADATA,
            context.getHandler()
        )
        if (cacheKey) {
            const req = context.switchToHttp().getRequest()
            const { take = 10, skip = 0 } = req.query
            console.log('result key is:' , `${cacheKey}-take=${take}-skip=${skip}`)
            return `${cacheKey}-take=${take}-skip=${skip}`
        }
        return super.trackBy(context)
    }
}