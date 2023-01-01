import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
const fileType = require('file-type')

const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']

export const multerConfigOptions: MulterOptions = {
    storage: diskStorage({
        destination: './apps/users/images',
        filename(req, file, callback) {
            console.log('validation done', file)
            const ext = extname(file.originalname)
            console.log('\n ext', ext)
            const fileName = uuid() + ext
            console.log('\n file name', fileName)
            callback(null, fileName)
        },
    }),
    fileFilter(req, file, callback) {
        console.log('file', file)
        allowedMimeTypes.includes(file.mimetype) ?
            callback(null, true) :
            callback(new BadRequestException('file must be a png or jpg/jpeg'), false)
    }
}

export const isImageExtSafe = async (fullImagePath: string) => {
    const fileInfo = await fileType.fromFile(fullImagePath)
    console.log('file info', fileInfo)
    if (!fileInfo) return false

    const isFileExtSafe = ['png', 'jpg', 'jpeg'].includes(fileInfo.ext)
    const isFileMimeSafe = allowedMimeTypes.includes(fileInfo.mime)
    
    return isFileExtSafe && isFileMimeSafe
}