# cording: UTF-8

import os
import sys
import numpy as np
import configparser

import img_util as iu

class Crop:
  def __init__(self):
    # config読み込み
    config = configparser.ConfigParser()
    config.read("crop_config.ini")

    # configの値設定
    self.enable       = int(config["common"]["enable"])
    self.full_img_num = int(config["common"]["full_img_num"])
    self.cf_blob_num  = int(config["common"]["cf_blob_num"])

    self.sta_x = int(config["crop"]["sta_x"])
    self.sta_y = int(config["crop"]["sta_y"])

    if (config["crop"]["end_or_size"] == "end"):
      self.end_x = int(config["crop"]["end_x"])
      self.end_y = int(config["crop"]["end_y"])
    else:
      width  = int(config["crop"]["end_x"])
      height = int(config["crop"]["end_y"])
      self.end_x = self.sta_x + width
      self.end_y = self.sta_y + height

  def CropImg(self, pat_name):
    # 入力画像取得とpattern.txtを出力
    img_ary = self.DumpCropPattern(pat_name)

    # 出力先
    out_dir = os.path.dirname(img_ary) + "\\crop"
    if (os.path.exists(out_dir) == False): # なかったら作成
      os.makedirs(out_dir)

    # Crop
    cnt = 0
    for img in img_ary:
      # Crop
      if (cnt < self.full_img_num):
        crop_bin = self.CropFullImg(out_dir, img)
      else:
        crop_bin = self.CropBinImg(out_dir, img)

      # 保存
      fn_path = os.path.join(out_dir, os.path.basename(img))
      iu.writeBin(fn_path, crop_bin)

      cnt += 1

  # Crop後のテキスト出力 (入力画像も一緒に取得する)
  def DumpCropPattern(self, pat_name):
    # 入力画像名を確保するリスト
    img_ary = []

    test_case_dir = "..\\" # ★変更必要
    pat_txt = os.path.join(test_case_dir, "param", pat_name, pat_name + ".txt")
    out_txt = os.path.join(test_case_dir, "param", pat_name, pat_name + "_crp.txt")

    with open(pat_txt, "r") as fr, open(out_txt, "w") as fw:
      for line in fr.readlines():
        if (line.find("aaa") != -1):
          line_sp = line.split()

          bin_fn = line_sp[2]
          crp_bin_path = "\\".join([os.path.dirname(bin_fn), "crop", os.path.basename(bin_fn)])

          fw.write(" ".join([line_sp[0:2], crp_bin_path, line_sp[3:]]))

          img_ary.append(os.path.join(test_case_dir, "image", bin_fn)) # 入力画像名格納 # ★変更必要
          pass
        else:
          fw.write(line)

    return img_ary

  # Full sizeのCrop
  def CropFullImg(self, out_dir, img):
    ibin = iu.readBin(img)

    sta_x = self.sta_x - (self.sta_x % self.cf_blob_num)
    sta_y = self.sta_y - (self.sta_y % self.cf_blob_num)
    end_x = self.end_x - (self.end_x % self.cf_blob_num)
    end_y = self.end_y - (self.end_y % self.cf_blob_num)

    crop_bin = ibin[sta_y:end_y, sta_x:end_x] # Crop

    return crop_bin


  # Bin sizeのCrop
  def CropBinImg(self, img):
    ibin = iu.readBin(img)

    div_num = self.cf_blob_num / 2

    sta_x = (self.sta_x - (self.sta_x % self.cf_blob_num)) / div_num
    sta_y = (self.sta_y - (self.sta_y % self.cf_blob_num)) / div_num
    end_x = (self.end_x - (self.end_x % self.cf_blob_num)) / div_num
    end_y = (self.end_y - (self.end_y % self.cf_blob_num)) / div_num

    crop_bin = ibin[sta_y:end_y, sta_x:end_x] # Crop

    return crop_bin

  def debugPrintSetting(self):
    print("enable: ", self.enable)
    print("full_img_num: ", self.full_img_num)
    print("cf_blob_num: ", self.cf_blob_num)
    print("sta_x: ", self.sta_x)
    print("sta_y: ", self.sta_y)
    print("end_x: ", self.end_x)
    print("end_y: ", self.end_y)

if __name__ == "__main__":
  crop = Crop()

  crop.debugPrintSetting()
  # crop.DumpCropPattern()
  # crop.CropImg()