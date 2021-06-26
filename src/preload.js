const { contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld("api", {
  send:         async (data) => await ipcRenderer.invoke("sample" , data),
  send_2:       async (data) => await ipcRenderer.invoke("sample2", data),
  show_pat:     async ()     => await ipcRenderer.invoke("show_pat"),
  process_kill: async ()     => await ipcRenderer.invoke("process_kill"),
  crop_config:  async (data) => await ipcRenderer.invoke("crop_config", data),
});