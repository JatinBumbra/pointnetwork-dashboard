import { http, https } from 'follow-redirects'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { platform, arch } from 'process'
import welcome from '../src/welcome'
import axios from 'axios'
const rimraf = require('rimraf')

const getOSAndArch = () => {
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

const getlatestReleaseVersion = async () => {
  const url =
    'https://api.github.com/repos/pointnetwork/pointnetwork/releases/latest'
  const headers = { 'user-agent': 'node.js' }
  const res = await axios.get(url, {
    headers: headers,
  })

  console.log('last version', res.data.tag_name)
  return res.data.tag_name
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

const getLiveDirectoryPathResources = () => {
  return path.join(getHomePath(), '.point', 'keystore', 'liveprofile')
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

const getInstalledVersion = () => {
  const pointPath = getPointPath()
  try {
    const versionData = fs.readFileSync(path.join(pointPath, 'infoNode.json'))
    const version = versionData.toString()
    const installedVersion = JSON.parse(version)
    return installedVersion
  } catch (error) {
    return {
      installedReleaseVersion: 'old',
    }
  }
}

const getInstalledFirefoxVersion = () =>{
  const pointPath = getPointPath()
  try {
    const versionData = fs.readFileSync(path.join(pointPath, 'infoFirefox.json'))
    const version = versionData.toString()
    const installedVersion = JSON.parse(version)
    return installedVersion
  } catch (error) {
    return {
      installedReleaseVersion: 'old'
    }
  }

}

const logout = () => {
  const pointPath = getPointPath()
  // Removing key files.
  if (fs.existsSync(path.join(pointPath, 'contracts')))
    rimraf.sync(path.join(pointPath, 'contracts'))
  fs.unlinkSync(getKeyFileName())
  fs.unlinkSync(getArweaveKeyFileName())
  // Relaunching the dashboard to ask for key or generate a new one.
  welcome(true)
}

const getPointPath = () => {
  return path.join(getHomePath(), '.point')
}

const getPointSrcPath = () => {
  return path.join(getPointPath(), 'src')
}

const getPointSoftwarePath = () => {
  return path.join(getPointPath(), 'software')
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

const copyFileSync = (source: string, target: string) => {
  let targetFile = target

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source))
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source))
}

const copyFolderRecursiveSync = (source: string, target: string) => {
  let files = []

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach(function (file) {
      const curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        copyFileSync(curSource, targetFolder)
      }
    })
  }
}

const getBinPath = () => {
  const dir = path.join(getHomePath(), '.point', 'bin')
  if (!fs.existsSync(dir)) {
    fs.mkdirpSync(dir)
  }
  return dir
}

const countFilesinDir = async (dir: string): Promise<number> => {
  let fileCount = 0
  const entries = await fs.readdir(dir)

  for (const entry of entries) {
    const fullpath = path.resolve(dir, entry)
    const stats = await fs.stat(fullpath)
    if (stats.isDirectory()) {
      fileCount += await countFilesinDir(fullpath)
    } else {
      fileCount++
    }
  }

  return fileCount
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
  getBinPath,
  copyFileSync,
  copyFolderRecursiveSync,
  getPointPath,
  getlatestReleaseVersion,
  getInstalledVersion,
  getInstalledFirefoxVersion,
  getLiveDirectoryPathResources,
  countFilesinDir,
})
