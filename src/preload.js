const { contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld("api", {
  send            : async (data) => await ipcRenderer.invoke("sample" , data),
  send_2          : async (data) => await ipcRenderer.invoke("sample2", data),
  gen_test_case   : async ()     => await ipcRenderer.invoke("gen_test_case"),
  process_kill    : async ()     => await ipcRenderer.invoke("process_kill"),
  crop_config     : async (data) => await ipcRenderer.invoke("crop_config", data),
  write_param     : async (data) => await ipcRenderer.invoke("write_param", data),
  get_crop_setting: async (data) => await ipcRenderer.invoke("get_crop_setting", data),
  edit_file       : async (data) => await ipcRenderer.invoke("edit_file", data),
  gen_script      : async (data) => await ipcRenderer.invoke("gen_script", data),
  select_file     : async (data) => await ipcRenderer.invoke("select_file", data),

  on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
});