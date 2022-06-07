$(function() {
  { // Crop設定を行う (crop.htmlの時のみ意味のある処理)
    const crop_setting_promise = window.api.get_crop_setting();

    crop_setting_promise.then((res, failres) => { // promise objectの使い方がよくわかっていない
      console.log(res)
      SetCropSetting(res);
    })

  }

  $("#button1").on("click", function() {
    window.api.send("good job");
  })

  // Crop メニューを押した時の処理
  $("#crop").on("click", function() {
    url = "crop.html";
    // const win = window.open(url, "", "width=245, height=430");
    window.location.href = url;
  })

  // edit メニューを押した時の処理
  {
    $("#edit").on("click", function() {
      url = "edit.html";
      //const win = window.open(url, "", "width=245, height=430");
      window.location.href = url;
    })

    // edit メニューのファイル編集ボタンを押したときの処理
    $("#edit-blocks-xlsx").on("click", function() {
      window.api.edit_file("blocks_xlsx");   
    })
    $("#edit-blocks-vsdx").on("click", function() {
      window.api.edit_file("blocks_vsdx");   
    })
    $("#edit-param-xlsx").on("click", function() {
      window.api.edit_file("param_xlsx");   
    })
    $("#edit-testcase-xlsx").on("click", function() {
      window.api.edit_file("testcase_xlsx");   
    })
    
    // gen
    $("#gen-param").on("click", function() {
      window.api.gen_script("gen_param");   
    })
    $("#gen-blocks").on("click", function() {
      window.api.gen_script("gen_blocks");   
    })
  }

  // config を開く
  $("#config").on("click", function() {
    window.api.edit_file("config");   
  })

  $("#run").on("click", function() {
    // checkがついているものを取得
    const ary_list = get_check_list();

    // checkがついているものだけを実行
    const message = window.api.send_2(ary_list);

    // message.then((res, failres) => { // promise objectの使い方がよくわかっていない
    //   const stdout = res.trim().split("\n");
    //   console.log(stdout);
    // });
  })

  $("#show-pat").on("click", function() {
    const dir_res = window.api.gen_test_case();
    dir_res.then((res, failres) => { // promise objectの使い方がよくわかっていない
      const pattern_list = res.trim().split("\n");
      AddPatternList(pattern_list);
    });
  })

  $("#chk-del").on("click", function() {
    $(".pat-check-box").each(function(i, elem) {
      $(elem).prop("checked", false);
    })
  })

  $("#chk-all").on("click", function() {
    $(".pat-check-box").each(function(i, elem) {
      $(elem).prop("checked", true);
    })
  })

  $("#kill-process").on("click", function() {
    window.api.process_kill();
  })

  // チェックがついているボックスのラベルを取得する
  function get_check_list() {
    var ary_list = []; // ここに入れる

    $(".pat-check-box").each(function(i, elem) {
      if ($(elem).prop("checked") == true) { // checkがついていたらリストに追加
        let box_text = $(elem).parent().text().trim();
        ary_list.push(box_text);
      }

      })

    return ary_list;
  }

  // pattern listを取得してGUIに追加する
  function AddPatternList(pattern_list) {
    // 現在のpattern listを削除
    $(".table-elem").remove();

    // 新しくpattern listを登録
    var cnt = 0; // 個数カウント
    for (const p of pattern_list) {
      // pattern追加
      $("#table-elem-top").append(`
        <div class="table-elem">
          <label  for="checkbox${cnt}">
            <input id="checkbox${cnt}" type="checkbox" class="pat-check-box">${p}
          </label>
        </div>
      `);
      cnt++; // 個数カウント
    }
  }

  // パタン名右クリックしたときの処理
  $(document).on("contextmenu", ".table-elem", function() {
    const text_str = $(this).text().replace(/\r?\n/g, "").trim();
    window.api.write_param(text_str);
  })

  // ===== Child =======
  {
    // == crop ==
    $(".crop-onoff-label").on("click", function() {
      SetCropOnOffText();
    })

    function SetCropOnOffText() {
      var state_txt = " Crop: ";
      if ($(".crop-onoff-toggle").prop("checked") == true) {
        state_txt = state_txt + "ON";
      } else {
        state_txt = state_txt + "OFF";
      }

      $(".onoff-state").text(state_txt);
    }

    $("#apply").on("click", function() {
      var ary_list = []; // ここに入れる

      // ON/OFF
      if ($(".crop-onoff-toggle").prop("checked") == true) {
        ary_list.push(1);
      } else {
        ary_list.push(0);
      }

      // full img num
      var full_img_num = $("select[name=img-num-select]").val();
      ary_list.push(full_img_num);

      // cf blob
      var cf_blob_num = $("select[name=cf-blob-num-select]").val();
      ary_list.push(cf_blob_num);

      // start x, y
      var sta_x = $("#sta_x").val();
      if (sta_x === "") sta_x = 0
      var sta_y = $("#sta_y").val();
      if (sta_y === "") sta_y = 0
      ary_list.push(sta_x);
      ary_list.push(sta_y);

      // end or size
      var end_or_size = $("select[name=end_or_size]").val();
      ary_list.push(end_or_size);
      // end x, y
      var end_x = $("#end_x").val();
      if (end_x === "") end_x = 0
      var end_y = $("#end_y").val();
      if (end_y === "") end_y = 0
      ary_list.push(end_x);
      ary_list.push(end_y);

      console.log(ary_list);

      window.api.crop_config(ary_list);
      SetCropSetting(ary_list);
    })

    $("#crop-reset").on("click", () => {
      var ary_list = ["0", 1, 6, 0, 0, "end", 0, 0];
      window.api.crop_config(ary_list);
      SetCropSetting(ary_list);
    })

    // Cropの設定値を取得して再設定する
    function SetCropSetting(crop_setting) {
      if (crop_setting.length != 0) {
        if (crop_setting[0] == "1") {
          $(".crop-onoff-toggle").prop("checked", true);
          SetCropOnOffText();

          const pre_title = $("title").html().replace(" [crop]", "");
          $("title").html(pre_title + " [crop]")
        } else {
          $(".crop-onoff-toggle").prop("checked", false);
          SetCropOnOffText();

          const pre_title = $("title").html();
          $("title").html(pre_title.replace(" [crop]", ""))
        }
        $("*[name=img-num-select]")    .val(crop_setting[1]);
        $("*[name=cf-blob-num-select]").val(crop_setting[2]);
        $("#sta_x")                    .val(crop_setting[3]);
        $("#sta_y")                    .val(crop_setting[4]);
        $("*[name=end_or_size]")       .val(crop_setting[5]);
        $("#end_x")                    .val(crop_setting[6]);
        $("#end_y")                    .val(crop_setting[7]);
      }
    }
  }

  // mainのcmd_messageをtextarea1に送る
  window.api.on("cmd_message", (event, cmd_message) => {
    const pre_scroll_top    = $("#textarea1").scrollTop();
    const pre_scroll_height = $("#textarea1")[0].scrollHeight;
    const outerHeight       = $("#textarea1").outerHeight();

    $("#textarea1").val(cmd_message + "\n"); // messageを書き込む

    if (pre_scroll_height === (pre_scroll_top + outerHeight)) { // スクロールが最下部にあるときだけ、最下部にはりつける
      $("#textarea1").scrollTop($("#textarea1")[0].scrollHeight);
    }

    // console.log($("#textarea1").scrollTop());
    // console.log($("#textarea1")[0].scrollHeight);
    // console.log($("#textarea1").outerHeight());
  })
})