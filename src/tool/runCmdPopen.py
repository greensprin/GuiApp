# coding: UTF-8

import io
import sys
import subprocess

# 標準出力させながら外部プログラム実行
def RunCmdPopen(cmd):
  #print("exec cmd:", cmd)
  # shell=Trueはwindowsでは必要
  # stderrもstdoutとして出力する
  proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

  while True:
    line = proc.stdout.readline() # 出力を取得
    if (line):
      print(line.strip())
      #yield line

    if not line and proc.poll() is not None: # proc.poll()は、プログラム終了していない場合Noneを返す
      break # 出力がなくなり、かつプログラムが終了したらNoneを返す

if __name__ == "__main__":
  cmd = "dir"

  RunCmdPopen(cmd)