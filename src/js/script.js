$(function() {
  $("#button1").on("click", function() {
    window.api.send("good job");
  })

  // Crop メニューを押した時の処理
  $("#crop").on("click", function() {
    url = "crop.html";
    window.open(url, "", "width=245, height=430");
  })

  $("#run").on("click", function() {
    // checkがついているものを取得
    const ary_list = get_check_list();

    // checkがついているものだけを実行
    window.api.send_2(ary_list);
  })

  $("#show-pat").on("click", function() {
    const dir_res = window.api.show_pat();
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
  // == crop ==
  $(".crop-onoff-label").on("click", function() {
    var state_txt = " Crop: ";
    if ($(".crop-onoff-toggle").prop("checked") == true) {
      state_txt = state_txt + "ON";
    } else {
      state_txt = state_txt + "OFF";
    }

    $(".onoff-state").text(state_txt);
  })

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
  })
})