import { BrowserWindow } from 'electron'
import Logger from '../../shared/logger'
import fs from 'fs-extra'
import helpers from '../../shared/helpers'
import path from 'path'
import util from 'util'
import { InstallationStepsEnum } from '../@types/installation'
import utils from '../../shared/utils'

const rimraf = require('rimraf')
const DecompressZip = require('decompress-zip')

const decompress = require('decompress')
const decompressTargz = require('decompress-targz')
const logger = new Logger()
const exec = util.promisify(require('child_process').exec)
const uninstallerName = 'uninstallerPoint.sh'

export default class Uninstaller {
  private installationLogger
  private window

  constructor(window: BrowserWindow) {
    this.window = window
    this.installationLogger = new Logger({ window, channel: 'installer' })
  }

  // Done
  getURL(filename: string, version: string) {
    const githubURL = helpers.getGithubURL()
    return `${githubURL}/pointnetwork/pointnetwork-uninstaller/releases/download/${version}/${filename}`
  }

  // Done
  getUninstallerFileName(version: string) {
    if (global.platform.win32)
      return `point-uninstaller-${version}-Windows-installer.zip`

    if (global.platform.darwin)
      return `point-uninstaller-${version}-MacOS-portable.tar.gz`

    return `point-uninstaller-${version}-Linux-Debian-Ubuntu.tar.gz`
  }

  async getBinPath() {
    const binPath = await helpers.getBinPath()
    if (global.platform.win32) {
      return path.join(binPath, 'win', 'pointUninstaller.exe')
    }
    if (global.platform.darwin) {
      return `${path.join(binPath, 'macos', 'pointUninstaller')}`
    }
    // linux
    return path.join(binPath, 'linux', 'pointUninstaller')
  }

  async isInstalled(): Promise<boolean> {
    this.installationLogger.info('Checking PointNode exists or node')

    const binPath = await this.getBinPath()
    if (fs.existsSync(binPath)) {
      this.installationLogger.info('PointNode already downloaded')
      return true
    }

    this.installationLogger.info('PointNode does not exist')
    return false
  }

  checkUninstallerExist = async () => {
    const temp = helpers.getPointPathTemp()
    if (!fs.existsSync(temp)) {
      this.window.webContents.send('uninstaller:check', true)
      await this.download()
      this.window.webContents.send('uninstaller:check', false)
    }
  }

  // Done
  download = () =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const version = await helpers.getlatestUninstallerReleaseVersion()
      const pointPath = helpers.getPointPath()
      const filename = this.getUninstallerFileName(version)

      const downloadPath = path.join(pointPath, filename)
      if (!downloadPath) {
        fs.mkdirpSync(downloadPath)
      }
      const downloadStream = fs.createWriteStream(downloadPath)
      const downloadUrl = this.getURL(filename, version)

      this.installationLogger.info(
        InstallationStepsEnum.POINT_UNINSTALLER,
        'Downloading Uninstaller...'
      )
      await utils.download({
        downloadUrl,
        downloadStream,
        onProgress: progress => {
          this.installationLogger.info(
            `${InstallationStepsEnum.POINT_UNINSTALLER}:${progress}`,
            'Downloading Uninstaller'
          )
        },
      })
      this.installationLogger.info(
        `${InstallationStepsEnum.POINT_UNINSTALLER}:100`,
        'Downloaded Uninstaller'
      )

      downloadStream.on('close', async () => {
        const temp = helpers.getPointPathTemp()
        if (fs.existsSync(temp)) rimraf.sync(temp)
        fs.mkdirpSync(temp)
        console.log('downloadPath', downloadPath)

        if (global.platform.win32) {
          const unzipper = new DecompressZip(downloadPath)
          await unzipper.extract({
            path: temp,
          })
          resolve(
            this.installationLogger.info(
              InstallationStepsEnum.POINT_UNINSTALLER,
              'Files decompressed'
            )
          )
        }
        if (global.platform.darwin) {
          decompress(downloadPath, temp, {
            plugins: [decompressTargz()],
          }).then(() => {
            fs.unlinkSync(downloadPath)
            resolve(
              this.installationLogger.info(
                InstallationStepsEnum.POINT_UNINSTALLER,
                'Files decompressed'
              )
            )
          })
        }
        if (global.platform.linux) {
          await this.writeLinuxScript()
          resolve(
            this.installationLogger.info(
              InstallationStepsEnum.POINT_UNINSTALLER,
              'script resolved'
            )
          )
        }
      })
    })

  async writeLinuxScript() {
    const temp = helpers.getPointPathTemp()
    // stringify JSON Object
    fs.writeFile(
      path.join(temp, uninstallerName),
      `#!/bin/bash
       rm -rf $HOME/.point`,
      'utf8',
      function (err: any) {
        if (err) {
          logger.info('An error occured while writing JSON Object to File.')
          return logger.info(err)
        }
        const temp = helpers.getPointPathTemp()

        const cmd = `chmod +x ${path.join(temp, uninstallerName)}`
        logger.info('Scriot linux created.')
        exec(cmd, (error: { message: any }, _stdout: any, stderr: any) => {
          logger.info('Launched uninstaller')
          if (error) {
            logger.info(`uninstaller launch exec error: ${error.message}`)
          }
          if (stderr) {
            logger.info(`uninstaller launch exec stderr: ${stderr}`)
          }
        })
      }
    )
  }

  async launch() {
    logger.info('Launching Uninstaller')
    const pointPath = helpers.getPointPathTemp()

    const file = path.join(pointPath, 'pointnetwork-uninstaller')
    let cmd = `${file}`
    if (global.platform.win32) cmd = `start ${file}.exe`
    if (global.platform.darwin) cmd = `open ${file}.app`

    if (global.platform.linux) {
      const temp = helpers.getPointPathTemp()
      cmd = `${path.join(temp, uninstallerName)}`
    }

    exec(cmd, (error: { message: any }, _stdout: any, stderr: any) => {
      logger.info('Launched uninstaller')
      if (error) {
        logger.info(`uninstaller launch exec error: ${error.message}`)
      }
      if (stderr) {
        logger.info(`uninstaller launch exec stderr: ${stderr}`)
      }
    })
  }
}
