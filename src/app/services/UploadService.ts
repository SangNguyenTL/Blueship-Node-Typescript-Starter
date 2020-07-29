import config from '@/app/config/index'
const { HOST_URL, UPLOAD } = config

import flatten from 'lodash/flatten'
import mime from 'mime-types'
import multer, { diskStorage } from 'multer'
import path from 'path'
import * as shell from 'shelljs'
import uuid from 'uuid/v4'

interface IUploadOption {
  type: 'image' | 'attachment'
}

class UploadService {
  /**
   * getYearMonth
   */
  public static getYearMonth() {
    const date = new Date()
    return path.join(date.getFullYear().toString(), String(date.getMonth() + 1))
  }
  /**
   * createFilePath
   * @param {String} rootPath
   * @param {String | undefined} fileName
   */
  public static createFilePath(rootPath: string, filename?: string) {
    const filePath = path.join(rootPath, this.getYearMonth())
    if (!shell.test('-e', filePath)) {
      shell.mkdir('-p', filePath)
    }
    return [filePath, filename].filter((v) => !!v).join('/')
  }
  /**
   * setUploader
   */
  public static setUploader(options: IUploadOption) {
    const storage = diskStorage({
      destination(_req, _file, cb) {
        cb(null, this.createFilePath(UPLOAD.path[options.type]))
      },
      filename(_req, file, cb) {
        const ext = mime.extension(file.mimetype)
        cb(null, [uuid(), ext].join('.'))
      },
    })

    const upload = multer({
      limits: {
        fileSize: UPLOAD.limits.fileSize[options.type],
        files: UPLOAD.limits.maxCount[options.type],
      },
      storage,
      fileFilter: (_req, file, cb) => {
        try {
          if (
            !flatten(
              Object.keys(UPLOAD.availableMime).map(
                (field) => UPLOAD.availableMime[field]
              )
            ).includes(file.mimetype)
          ) {
            throw new Error(
              'Uploaded file is not a valid image. Only image and pdf'
            )
          }
          cb(null, true)
        } catch (error) {
          cb(error, false)
        }
      },
    })

    return upload
  }
  /**
   * Get public URL of a file. The file must have public access
   * @param {string} filePath
   */
  public static getPublicUrl(
    category: string,
    objectId: string,
    originFileName: string
  ) {
    return [HOST_URL, category, objectId, originFileName].join('/')
  }
}

export default UploadService
