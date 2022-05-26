'use strict'

const { app, BrowserWindow, ipcMain } = require( 'electron' );
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const ini = require("ini");

let main_gui = null;
let process_state = 0; // process状態保存
let pid = 0;

const cur_dir = process.cwd();

app.on( 'ready', () =>
{
    let win_option = {
        //frame: false,
        width: 400,
        height: 700,
        minWidth: 400,
        minHeight: 350,
        autoHideMenuBar: true, // menu bar を自動で消してくれる
        webPreferences: {
            experimentalFeatures:   false,
            nodeIntegration:        false,
            contextIsolation: true,
            preload: __dirname + "/preload.js",
        }
    }

    main_gui = new BrowserWindow( win_option )
    main_gui.loadURL( path.join('file:', __dirname, 'renderer-process.html' ));
    //main_gui.setMenu(null); // tool bar を消す

    console.log(__dirname);

    // main_gui.webContents.openDevTools()     // debug

    // Main Process --> Renderer Process
    // const crop_setting = GetCropConfig()
    // console.log(crop_setting)
    // main_gui.webContents.send("get_crop_config", crop_setting)

} )


// ==== IPC通信 ====
ipcMain.handle("sample", (e, arg) => {
    console.log(arg);
    
    //let cmd = "python " + __dirname + "\\tool\\sample.py";
    let cmd = "python " + cur_dir + "\\tool\\sample.py";
    runCmd(cmd);
});

ipcMain.handle("sample2", (e, ary_arg) => {
    // pattern.txt生成
    const pattern_file = path.join(cur_dir, "pattern.txt");
    writePatternFile(pattern_file, ary_arg);

    // python script 実行 (pattern実行)
    const config = ini.parse(fs.readFileSync(path.join(cur_dir, "config.ini"), "utf8")); // read config.ini
    const script = path.join(cur_dir, config.run.script);
    runCmdSpawn("python", script, pattern_file);
});

ipcMain.handle("show_pat", (e) => {
    const config = ini.parse(fs.readFileSync(path.join(cur_dir, "config.ini"), "utf8")); // read config.ini
    const script = path.join(cur_dir, config.test_case.script);
    const message = childProcess.execSync("python " + script).toString();
    return message;
});

ipcMain.handle("crop_config", (e, ary_arg) => {
    const crop_config_file = "crop_config.ini"
    // == common ==
    fs.writeFileSync(crop_config_file, "[common]\n", "utf8");
    // ON/OFF
    fs.appendFileSync(crop_config_file, "enable="+ary_arg[0]+"\n", "utf8");
    // full img num
    fs.appendFileSync(crop_config_file, "full_img_num="+ary_arg[1]+"\n", "utf8");
    // cf blob num
    fs.appendFileSync(crop_config_file, "cf_blob_num="+ary_arg[2]+"\n", "utf8");

    // == crop ==
    fs.appendFileSync(crop_config_file, "[crop]\n", "utf8");
    // start
    fs.appendFileSync(crop_config_file, "sta_x="+ary_arg[3]+"\n", "utf8");
    fs.appendFileSync(crop_config_file, "sta_y="+ary_arg[4]+"\n", "utf8");
    // end or size
    fs.appendFileSync(crop_config_file, "end_or_size="+ary_arg[5]+"\n", "utf8");
    fs.appendFileSync(crop_config_file, "end_x="+ary_arg[6]+"\n", "utf8");
    fs.appendFileSync(crop_config_file, "end_y="+ary_arg[7]+"\n", "utf8");
});

ipcMain.handle("write_param", (e, arg) => {
    // 設定ファイル取得
    const config = ini.parse(fs.readFileSync(path.join(cur_dir, "config.ini"), "utf8")); // read config.ini
    // 探索するフォルダを指定
    const test_dir = config.test_case.dir_path;
    const dir = path.join(test_dir, arg)

    // フォルダ内のファイルを取得
    const filenames = fs.readdirSync(dir);

    // ファイルを順番に開いて編集できるようにしている。ファイルがなければ何も起動されない。
    // 基本的には1ファイルしかないことを想定していいと思うが一応
    filenames.forEach((filename) => {
        // コマンド設定
        // const cmd = `notepad ${path.join(dir, filename)}` ; 
        const cmd = `${path.join(dir, filename)}` ; 
        console.log(cmd);
        // コマンド実行
        childProcess.exec(cmd);
    })
})

ipcMain.handle("process_kill", (e) => {
    // プロセス削除
    if (process_state === 1) {
        clean_up();
    }
});
//process.on("SIGINT" , clean_up());
//process.on("SIGTERM", clean_up());
//process.on("SIGQUIT", clean_up());

ipcMain.handle("get_crop_setting", (e) => {
    const crop_setting = GetCropConfig();
    return crop_setting;
});

// for edit.html
ipcMain.handle("edit_file", (e, arg) => {
    const config = ini.parse(fs.readFileSync(path.join(cur_dir, "config.ini"), "utf8")); // read config.ini
    var edit_file_name = "";

    if        (arg == "blocks_xlsx") {
        edit_file_name = config.blocks_file.excel;
    } else if (arg == "blocks_vsdx") {
        edit_file_name = config.blocks_file.visio;
    } else if (arg == "param_xlsx") {
        edit_file_name = config.param_xls.excel;
    } else if (arg == "testcase_xlsx") {
        edit_file_name = config.test_case_xls.excel;
    } else if (arg == "config") {
        edit_file_name = path.join(cur_dir, "config.ini");
    } else {
        console.log(arg + " is not found.");
        return;
    }

    console.log(edit_file_name);

    // コマンド設定
    const cmd = `${edit_file_name}` ; 
    console.log(cmd);
    // コマンド実行
    childProcess.exec(cmd);

});

function runCmdSpawn(cmd, script="", pattern_file="") {
    if (process_state === 0) {
        process_state = 1; // process状態更新 (実行中)

        const child = childProcess.spawn(cmd, [script, pattern_file]);
        pid = child.pid; // process id を保存

        child.stdout.on("data", (data) => {
            console.log(data.toString());
        });
        child.stderr.on("data", (data) => {
            console.log(data.toString());
        });
        child.on("close", (code) => {
            console.log(`child process close all stdio with code ${code}`);
            process_state = 0; // process状態更新 (終了)
        })
    } else {
        console.log("process is already running.");
    }
}

function runCmd(cmd) {
    var message = "";
    childProcess.exec(cmd, (error, stdout, stderr) => {
        if (error != null) {
            console.log(error);
        } else {
            console.log(stdout);
            message = stdout;
        }
    })
    return message;
}

function writePatternFile(pattern_file, ary_arg) {
    var cnt=0; // カウント用
    if (ary_arg.length === 0) { // 何も選択されていない場合、何も記載しない
        fs.writeFileSync(pattern_file, "", "utf8");
    } else { // 何かしら選択されているとき
        ary_arg.forEach(elem => {
            if (cnt === 0) {
                fs.writeFileSync(pattern_file, elem+"\n", "utf8"); // i = 0の時は、ファイルを新規作成
            } else {
                fs.appendFileSync(pattern_file, elem+"\n", "utf8"); // そうでないときは、ファイルに追記
            }
            cnt++;
        });
    }
}

function clean_up() {
    process.kill(pid);
}

function GetCropConfig() {
    var crop_setting = []

    if (fs.existsSync(path.join(cur_dir, "crop_config.ini"))) {
        const config = ini.parse(fs.readFileSync(path.join(cur_dir, "crop_config.ini"), "utf8")); // read config.ini

        crop_setting.push(config.common.enable)
        crop_setting.push(config.common.full_img_num)
        crop_setting.push(config.common.cf_blob_num)
        crop_setting.push(config.crop.sta_x)
        crop_setting.push(config.crop.sta_y)
        crop_setting.push(config.crop.end_or_size)
        crop_setting.push(config.crop.end_x)
        crop_setting.push(config.crop.end_y)
    }

    return crop_setting
}