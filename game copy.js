/// <reference path="fun.js"/>
var xhr;
var basic_data;
var track;
var audio;
document.addEventListener("DOMContentLoaded", function () {
  // console.log("start to init!");
  // app = new PIXI.Application({
  //   view: document.querySelector("canvas"),
  //   width: window.innerWidth,
  //   height: window.innerHeight,
  // });
  init(document.querySelector("canvas"));
  var param = new URL(window.location.href).searchParams;
  if (param.has("n")) read_struct(`songs/${param.get("n")}/`);
  else console.warn("n not selected!");
});

function read_struct(root_path) {
  var resolve_;
  new Promise(function (resolve, reject) {
    resolve_ = resolve;
    xhr = new XMLHttpRequest();
    xhr.open("get", root_path + "/config.json");
    xhr.onreadystatechange = function (res) {
      if (this.readyState == 4 && this.status == 200) {
        basic_data = JSON.parse(xhr.responseText);
        //document.querySelector("#AudioPlayer > source").src=root_path+ basic_data.path.audio;
        audio = new Audio(root_path + basic_data.path.audio);
        resolve();
      }
    };
    xhr.send();
  }).then(function (resolve, reject) {
    //console.log(basic_data);
    xhr = new XMLHttpRequest();
    xhr.open("get", root_path + basic_data.path.midi);
    xhr.onreadystatechange = function (res) {
      if (this.readyState == 4 && this.status == 200) {
        track = JSON.parse(xhr.responseText).tracks.map((element) => {
          return element.notes.map((x) => {
            return {
              time: x.time,
              duration: x.duration,
              name: x.name,
            };
          });
        });
        basic_data.play.drop.speed =
          (basic_data.play.drop.speed * window.innerHeight) / 754;
        //start_play();
        document.querySelector(".term-of-use").innerHTML =
          basic_data.term || "download from ...";
        document.querySelector("#fin-load").classList.remove("d-none");
        document.querySelector("#track_amo").innerHTML =
          basic_data.play.click.cal / basic_data.play.click.per;
        document.querySelector("#diff-info").innerHTML = `
        <h4>config.json</h4>
        "play": {<br>
          &nbsp&nbsp"track":{<br>
            &nbsp&nbsp&nbsp&nbsp"forbid": [${basic_data.play.track.forbid.join(
              ","
            )}]<br>
            &nbsp&nbsp},<br>
          &nbsp&nbsp"drop": {<br>
            &nbsp&nbsp&nbsp&nbsp"speed": ${basic_data.play.drop.speed},<br>
            &nbsp&nbsp&nbsp&nbsp"delay": ${basic_data.play.drop.delay},<br>
            &nbsp&nbsp&nbsp&nbsp"maxdur": ${basic_data.play.drop.maxdur},<br>
            &nbsp&nbsp&nbsp&nbsp"end": ${basic_data.play.drop.end}<br>
            &nbsp&nbsp},<br>
            &nbsp&nbsp"click": {<br>
            &nbsp&nbsp&nbsp&nbsp"per": ${basic_data.play.click.per},<br>
            &nbsp&nbsp&nbsp&nbsp"low": ${basic_data.play.click.low},<br>
            &nbsp&nbsp&nbsp&nbsp"cal": ${basic_data.play.click.cal},<br>
            &nbsp&nbsp&nbsp&nbsp"high": ${basic_data.play.click.high},<br>
            &nbsp&nbsp&nbsp&nbsp"trans": { }<br>
            &nbsp&nbsp}<br>
        }<br>
        `;
        $("#staticBackdrop").on("hidden.bs.modal", start_play);
        $("#staticBackdrop").modal("show");
      }
    };
    xhr.send();
  });
}
var col_list = {};
var col_arr = [];
function get_col(nu) {
  if (col_list[nu]) return col_list[nu];
  else {
    var temp = `resource/dropc${Math.floor(Math.random() * 7) + 1}.png`;
    if (col_arr.includes(temp) && Math.random() > 0.15) return get_col();
    col_arr.push(temp);
    col_list[nu] = temp;
    return temp;
  }
}
var drop_list = [];
var started_ = false;

function drop(point, len) {
  //console.log(point);
  var nu_name = Math.ceil(
    (ctn(point) - basic_data.play.click.low) / basic_data.play.click.per + 0.1
  );
  drop_list.push(
    new square(new PIXI.Sprite(PIXI.Texture.from(get_col(nu_name)))) //"resource/drop.png"
  );
  var to_btn = basic_data.play.click.cal / basic_data.play.click.per;

  // drop_list[drop_list.length - 1].x =
  //   ((nu_name - 0.5) / to_btn) * window.innerWidth;
  drop_list[drop_list.length - 1].x =
    (window.innerWidth / basic_data.play.click.cal) *
    (ctn(point) - basic_data.play.click.low);
  drop_list[drop_list.length - 1].width =
    window.innerWidth / basic_data.play.click.cal - 2;
  drop_list[drop_list.length - 1].x += 1;
  //console.log(drop_list[drop_list.length - 1].x);
  var temp =
    Math.min(len || 0.2, basic_data.play.drop.maxdur) *
    60 *
    basic_data.play.drop.speed;
  //console.log(temp);
  drop_list[drop_list.length - 1].y = -temp;
  drop_list[drop_list.length - 1].height = temp;
  drop_list[drop_list.length - 1].name = nu_name;
  if (
    drop_list[drop_list.length - 1].x < 0 ||
    drop_list[drop_list.length - 1].x > window.innerWidth
  ) {
    //console.warn(`point:${point},nu_name:${nu_name},to_btn:${to_btn}`);
    console.warn(`out of the selected range!${point}`);
    setTimeout(function () {
      wa--;
    }, ((window.innerHeight / basic_data.play.drop.speed) * 1000) / 60);
  }
}

function ctn(str) {
  const dic = {
    A: 1,
    "A#": 2,
    B: 3,
    C: 4,
    "C#": 5,
    D: 6,
    "D#": 7,
    E: 8,

    F: 9,
    "F#": 10,
    G: 11,
    "G#": 12,
  };
  var char, num;
  if (/#/.test(str)) {
    char = str[0] + "#";
    num = str[2];
  } else {
    char = str[0];
    num = str[1];
  }
  return 12 * (+num - 1) + dic[char];
}

var cur_time = 0; //ms
var interval_list = [];
var pause = true;
var ac = 0;
var wa = 0;
var end_inte;
var track_amo;

function gethp() {
  return Math.floor(
    (100 *
      (basic_data.play.track.total + ac * 0.1 - wa * 1.3 - click_times * 0.6)) /
      basic_data.play.track.total
  );
}
function end_() {
  //alert(`ac:${ac},wa:${wa},clicks:${click_times}`);
  document.querySelector("#score").innerHTML = `<ul class="list-group">
            <li class="list-group-item">正確:${ac}</li>
            <li class="list-group-item">遺漏:${wa}</li>
            <li class="list-group-item">點擊失誤:${click_times}</li>
          </ul>`;
  if (gethp() > 60)
    document.querySelector("#score").innerHTML += `<br><h4>通過</h4>`;
  else document.querySelector("#score").innerHTML += `<br><h4>失敗</h4>`;
  $("#exampleModal").on("hidden.bs.modal", () => {
    window.location.reload();
  });
  $("#exampleModal").modal("show");
  //;
}
var touch_temp = [];
function start_play() {
  keybroad = {
    k1: false,
    k2: false,
    k3: false,
    k4: false,
    k5: false,
    k6: false,
    k7: false,
    k8: false,
    k9: false,
  };
  interval_list.forEach((x) => {
    clearInterval(x);
  });
  interval_list = [];
  if (!started_) {
    document.addEventListener("keydown", (event) => {
      const keyName = event.code;
      if (setting[keyName]) keybroad[setting[keyName]] = true;
    });
    document.addEventListener("keyup", (event) => {
      const keyName = event.code;
      if ("Escape" != keyName)
        if (setting[keyName]) {
          click_times++;
          keybroad[setting[keyName]] = false;
          //console.log(keybroad[setting[keyName]]);
        }
    });
    function event_handler(event) {
      var now_arr = [];
      //console.log(now_arr);
      for (let i = 0; i < event.touches.length; i++)
        if (event.touches[i].clientY > window.innerHeight / 3)
          now_arr.push(
            Math.ceil(
              ((event.touches[i].clientX / window.innerWidth) *
                basic_data.play.click.cal) /
                basic_data.play.click.per
            )
          );
        else start_play();

      now_arr
        .filter((x) => !touch_temp.includes(x))
        .forEach((x) => {
          keybroad[`k${x}`] = true;
        });
      touch_temp
        .filter((x) => !now_arr.includes(x))
        .forEach((x) => {
          keybroad[`k${x}`] = false;
          click_times++;
          //console.log("!");
        });
      touch_temp = now_arr;
    }
    document.addEventListener("touchstart", event_handler);
    document.addEventListener("touchmove", event_handler);
    document.addEventListener("touchend", event_handler);
    // document.addEventListener("touchend", (event) => {
    //   click_times++;
    // });
    track_amo = basic_data.play.click.cal / basic_data.play.click.per;
    var diff_index = basic_data.play.track.total / basic_data.play.drop.end;
    if (diff_index > 4.5)
      document.querySelector(
        ".score>div>span#info-st"
      ).innerHTML += `<span class="badge badge-danger">高(${
        Math.floor(diff_index * 10) / 10
      })</span>`;
    else if (diff_index > 2.5)
      document.querySelector(
        ".score>div>span#info-st"
      ).innerHTML += `<span class="badge badge-warning">中(${
        Math.floor(diff_index * 10) / 10
      })</span>`;
    else
      document.querySelector(
        ".score>div>span#info-st"
      ).innerHTML += `<span class="badge badge-success">低(${
        Math.floor(diff_index * 10) / 10
      })</span>`;
    document.querySelector(
      ".score>div>span#info-st"
    ).innerHTML += `&nbsp track:${track_amo},`;
    var tem2 = basic_data.play.click.cal / basic_data.play.click.per;
    for (let i = 1; i < tem2; i++) {
      var bor = new square(
        new PIXI.Sprite(PIXI.Texture.from("resource/border.png"))
      );
      bor.height = window.innerHeight;
      bor.width = 2;
      bor.y = 0;
      bor.x = (window.innerWidth / tem2) * i - 1;
    }
    end_inte = setInterval(() => {
      //end
      if (cur_time > 1000 * basic_data.play.drop.end) {
        //alert(`ac:${ac},wa:${wa},clicks:${click_times}`);
        // document.querySelector("#score").innerHTML = `<ul class="list-group">
        //         <li class="list-group-item">正確:${ac}</li>
        //         <li class="list-group-item">遺漏:${wa}</li>
        //         <li class="list-group-item">點擊失誤:${click_times}</li>
        //       </ul>`;
        // if (
        //   gethp() > 60
        // )
        //   document.querySelector("#score").innerHTML += `<br><h4>通過</h4>`;
        // else document.querySelector("#score").innerHTML += `<br><h4>失敗</h4>`;
        // $("#exampleModal").modal("show");
        end_();
        clearInterval(end_inte);
      }
    }, 500);
    cur_time =
      basic_data.play.drop.delay * -1000 +
      (window.innerHeight / 60 / basic_data.play.drop.speed) * 1000; //change 116
    started_ = true;
    for (var s = 0; s < track.length; s++) {
      if (basic_data.play.track.forbid.includes(s)) track[s] = [];
      track[s] = track[s].reverse();
    }
    interval_list.push(
      setTimeout(() => {
        audio.play();
      }, 1000 * basic_data.play.drop.delay)
    );
    document.addEventListener("keydown", function (e) {
      if (e.code == `Escape`) start_play();
    });
  }
  if (pause) {
    interval_list.push(
      setInterval(() => {
        document.querySelector(
          ".score>div>span#info"
        ).innerHTML = ` 正確:${ac} ,遺漏:${wa} ,剩餘時間:${Math.max(
          Math.floor(basic_data.play.drop.end - cur_time / 1000),
          0
        )}s`;
        //var temp = hp();
        var hp = gethp();
        if (hp < 0) {
          interval_list.forEach((x) => {
            clearInterval(x);
          });
          //pause
          start_play();
          // document.querySelector("#score").innerHTML = `<ul class="list-group">
          // <li class="list-group-item">正確:${ac}</li>
          // <li class="list-group-item">遺漏:${wa}</li>
          // <li class="list-group-item">點擊失誤:${click_times}</li>
          // </ul>`;
          // document.querySelector("#score").innerHTML += `<br><h4>失敗</h4>`;
          // $("#exampleModal").modal("show");
          end_();
          clearInterval(end_inte);
          //window.location.reload();
        }
        document.querySelector("#hp").innerHTML = `血量:${hp}%`;
        document.querySelector("#hp").setAttribute("style", `width:${hp}%`);
      }),
      1000
    );
    interval_list.push(
      setInterval(function () {
        drop_list = drop_list.filter((x) => {
          if (x.y <= window.innerHeight + 400) return true;
          x.delete();
          wa++;
          //console.log(`miss(${x.name})`);
          return false;
        });
        drop_list = drop_list.filter((x) => {
          if (x.y < window.innerHeight && window.innerHeight < x.y + x.height) {
            //change 116
            //console.log(`y:${x.y},hei:${x.height}`)
            if (keybroad["k" + x.name] == true) {
              //console.log("!")
              ac++;
              keybroad["k" + x.name] = false;
              click_times--;
              x.delete();
              return false;
            }
          }

          return true;
        });
        drop_list.forEach((element) => {
          element.y += basic_data.play.drop.speed;
        });
      }, 1000 / 60)
    );
    interval_list.push(
      setInterval(() => {
        cur_time += 10;
      }, 10)
    );
    interval_list.push(
      setInterval(() => {
        track.forEach((x) => {
          for (var i = x.length - 1; i >= 0; i--) {
            if (cur_time / 1000 - 1 > x[i].time) break;
            if (cur_time / 1000 + 0.04 < x[i].time) continue;
            drop(x[i].name, x[i].duration);
            x.pop();
          }
        });
      }, 30)
    );
    if (cur_time > 0) audio.play();
    pause = false;
  } else {
    audio.pause();
    pause = true;
  }
}

var keybroad = {
  k1: false,
  k2: false,
  k3: false,
  k4: false,
  k5: false,
  k6: false,
  k7: false,
  k8: false,
  k9: false,
};
var setting = {
  Digit1: "k1",
  Digit2: "k2",
  Digit3: "k3",
  Digit4: "k4",
  Digit5: "k5",
  Digit6: "k6",
  Digit7: "k7",
  Digit8: "k8",
};
var click_times = 0;
//http://127.0.0.1:5500/game.html
//sel-ent
var chg_act = false;
function chg_key(nu) {
  function evn(e) {
    var code = e.code;
    var close = false;
    for (const iter in setting) {
      var out_iter = iter;
      var af = setting[iter];
      if (iter == code) {
        //af and nu swap
        for (const iter in setting) {
          if (setting[iter] != "k" + nu) continue;
          //now iter(inner) is nu
          var temp = setting[out_iter];
          setting[iter] = setting[out_iter];

          document.querySelector(
            `#btn-se-${nu}>button`
          ).innerHTML = `更改(${code})`;
          document.querySelector(
            `#btn-se-${setting[out_iter][1]}>button`
          ).innerHTML = `更改(${iter})`;
          setting[out_iter] = "k" + nu;
          break;
        }
        close = true;
      }
    }
    if (!close)
      for (const iter in setting) {
        var be = iter;
        var af = setting[iter];
        document.querySelector(
          `#btn-se-${nu}>button`
        ).innerHTML = `更改(${code})`;
        if ("k" + nu == af) {
          // setting[code] = "k"+nu;
          // if(setting[be]=="k"+nu)
          // delete setting[be];
          // break;
          setting[code] = setting[be];
          delete setting[be];
          break;
        }
      }
    chg_act = false;
  }
  if (!chg_act) {
    document.addEventListener("keydown", evn, { once: true });
    chg_act = true;
  }
}
