# coding: UTF-8

import os
import sys
import configparser

# local
import runCmdPopen as rcp

def getPatter(target_dir):
  list_folder = os.listdir(target_dir)
  for folder in list_folder:
    print(folder)

  return list_folder

if __name__ == "__main__":
  # 設定ファイル取得
  config = configparser.ConfigParser()
  config.read("config.ini")
  # パス移動 (ここはpattern生成した場所に書き換える)
  target_dir = config["test_case"]["dir_path"]

  # target dirのフォルダを取得
  getPatter(target_dir)