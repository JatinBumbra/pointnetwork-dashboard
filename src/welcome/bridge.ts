import { contextBridge, ipcRenderer } from 'electron'
// Types
import {
  UninstallerChannelsEnum,
  WelcomeChannelsEnum,
  DashboardChannelsEnum,
  GenericChannelsEnum,
} from './../@types/ipc_channels'

declare global {
  // eslint-disable-next-line
  interface Window {
    Welcome: typeof api
  }
}

export const api = {
  // Welcome channels
  generateMnemonic: () =>
    ipcRenderer.send(WelcomeChannelsEnum.generate_mnemonic),
  validateMnemonic: (value: any) =>
    ipcRenderer.send(WelcomeChannelsEnum.validate_mnemonic, value),
  login: (object: any) => ipcRenderer.send(WelcomeChannelsEnum.login, object),
  copyMnemonic: (value: any) =>
    ipcRenderer.send(WelcomeChannelsEnum.copy_mnemonic, value),
  pasteMnemonic: () => ipcRenderer.send(WelcomeChannelsEnum.paste_mnemonic),
  getDictionary: () => ipcRenderer.send(WelcomeChannelsEnum.get_dictionary),
  // Uninstaller channels
  launchUninstaller: () => ipcRenderer.send(UninstallerChannelsEnum.launch),
  // Dashboard channels
  getDashboardVersion: () =>
    ipcRenderer.send(DashboardChannelsEnum.get_version),
  // Generic channels
  minimizeWindow: () => ipcRenderer.send(GenericChannelsEnum.minimize_window),
  closeWindow: () => ipcRenderer.send(GenericChannelsEnum.close_window),

  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Welcome', api)
