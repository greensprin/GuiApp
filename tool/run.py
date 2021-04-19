# coding: UTF-8

import os
import sys
import tqdm
import time 

# local
import runCmdPopen as rcp

def runPattern(pattern):
  # ここにpatternを実行する時の処理を書く
  print("\npattern name:", pattern)
  sys.stdout.flush() # 標準出力する
  time.sleep(1)

if __name__ == "__main__":
  pattern_text = sys.argv[1]

  with open(pattern_text, "r") as fp:
    patterns = fp.readlines()
    for pattern in tqdm.tqdm(patterns):
      runPattern(pattern)