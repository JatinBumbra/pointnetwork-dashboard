import { app } from 'electron'
import { http, https } from 'follow-redirects'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { platform, arch } from 'process'

const getOSAndArch = () => {
  console.log('platform', platform)
  // Returned values: mac, linux-x86_64, linux-i686, win64, win32, or throws an error
  let osAndArch = ''

  if (platform === 'darwin') {
    osAndArch = 'mac'
  }
  if (platform === 'linux') {
    if (arch === 'x64') {
      osAndArch = 'linux-x86_64'
    }
    if (arch === 'x32') {
      osAndArch = 'linux-i686'
    }
  }
  if (platform === 'win32') {
    if (arch === 'x64') {
      osAndArch = 'win64'
    }
    if (arch === 'x32') {
      osAndArch = 'win32'
    }
  }

  return osAndArch
}

const getPlatform = () => {
  global.platform = {
    darwin: platform === 'darwin',
    linux: platform === 'linux',
    win32: platform === 'win32',
  }
}

const getHTTPorHTTPs = () => {
  if (global.platform.win32) {
    return https
  }
  return http
}

const fixPath = (pathStr: string) => {
  if (global.platform.win32) {
    return pathStr.split(path.sep).join(path.posix.sep)
  }
  // linux & mac
  return pathStr
}

const getHomePath = () => {
  return os.homedir()
}

const getPNPath = () => {
  return path.join(getHomePath(), '.point', 'src', 'pointnetwork')
}

const getDashboardPath = () => {
  return path.join(getHomePath(), '.point', 'src', 'pointnetwork-dashboard')
}

const getSDKPath = () => {
  return path.join(getHomePath(), '.point', 'src', 'pointsdk')
}

const getBrowserFolderPath = () => {
  const browserDir = path.join(getHomePath(), '.point', 'src', 'point-browser')
  if (!fs.existsSync(browserDir)) {
    fs.mkdirpSync(browserDir)
  }
  return browserDir
}

const getLiveDirectoryPath = () => {
  return path.join(getHomePath(), '.point', 'keystore')
}

const getKeyFileName = () => {
  return path.join(getLiveDirectoryPath(), 'key.json')
}

const getArweaveKeyFileName = () => {
  return path.join(getLiveDirectoryPath(), 'arweave.json')
}

const isLoggedIn = () => {
  return fs.existsSync(getKeyFileName())
}

const logout = () => {
  // Removing key files.
  fs.unlinkSync(getKeyFileName())
  fs.unlinkSync(getArweaveKeyFileName())
  // Relaunching the dashboard to ask for key or generate a new one.
  app.relaunch()
  app.exit()
}

const getPointPath = () => {
  return path.join(getHomePath(), '.point/')
}

const getPointSrcPath = () => {
  return path.join(getPointPath(), 'src/')
}

const getPointSoftwarePath = () => {
  return path.join(getPointPath(), 'software/')
}

const isPNCloned = () => {
  return fs.existsSync(getPNPath())
}

const isDashboardCloned = () => {
  return fs.existsSync(getDashboardPath())
}

const isSDKCloned = () => {
  return fs.existsSync(getSDKPath())
}

export default Object.freeze({
  getOSAndArch,
  getPlatform,
  getHTTPorHTTPs,
  fixPath,
  getPNPath,
  getDashboardPath,
  getSDKPath,
  getBrowserFolderPath,
  getHomePath,
  getLiveDirectoryPath,
  getKeyFileName,
  getArweaveKeyFileName,
  isLoggedIn,
  logout,
  getPointSrcPath,
  getPointSoftwarePath,
  isPNCloned,
  isDashboardCloned,
  isSDKCloned,
})