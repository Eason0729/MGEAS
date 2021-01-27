"use strict";
//var stage;
var renderer;
var items = new Array();
var ticker;
var app;

/**
 * @function init
 * @param {HTMLElement} ele 
 */
function init(ele) {
  console.log("start to init!");
  app = new PIXI.Application({
    view: ele,
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

/**
 * @constructor square
 * @param {object} Sprite - Sprite form PIXI
 */
function square(Sprite) {
  this.items_ID = items.length;
  items.push(Sprite);
  app.stage.addChild(items[this.items_ID]);
}

/**
 * @function delete
 * @description delete the sprite
 */
square.prototype.delete = function () {
  app.stage.removeChild(this.raw);
  items[this.items_ID] = undefined;
};

Object.defineProperty(square.prototype, "x", {
  get: function () {
    return items[this.items_ID].x;
  },
  set: function (inp) {
    items[this.items_ID].x = inp;
  },
});
Object.defineProperty(square.prototype, "y", {
  get: function () {
    return items[this.items_ID].y;
  },
  set: function (inp) {
    items[this.items_ID].y = inp;
  },
});
Object.defineProperty(square.prototype, "rotate", {
  get: function () {
    return items[this.items_ID].rotation;
  },
  set: function (inp) {
    items[this.items_ID].rotation = inp;
  },
});
Object.defineProperty(square.prototype, "zIndex", {
  get: function () {
    return items[this.items_ID].zIndex;
  },
  set: function (inp) {
    items[this.items_ID].zIndex = inp;
  },
});
Object.defineProperty(square.prototype, "width", {
  get: function () {
    return items[this.items_ID].width;
  },
  set: function (inp) {
    items[this.items_ID].width = inp;
  },
});
Object.defineProperty(square.prototype, "height", {
  get: function () {
    return items[this.items_ID].height;
  },
  set: function (inp) {
    items[this.items_ID].height = inp;
  },
});
Object.defineProperty(square.prototype, "raw", {
  get: function () {
    return items[this.items_ID];
  },
});
/**
 *
 * @param {string} attr - attr name
 * @param {any} content - set content
 */
square.prototype.setraw = function (attr, content) {
  items[this.items_ID][attr] = content;
};
//push other
//[0,1,2,3,4]
square.prototype.pushList = new Array();
//bouncer
//[{
//self:0,
//bounce:-1,
//}]
//negative=>bounce  zero=>stop
square.prototype.bounceList = new Array();
//square.prototype.x = -1;
//square.prototype.y = -1;
/**
 * @function isIn
 * @param {Number} x - repersent the vertical position on canvas dimension
 * @param {Number} y - repersent the horizontal position on canvas dimension
 */
square.prototype.isIn = function (x, y, a) {
  if (!a) {
    a = 0;
  }
  var v_x = x - this.x; //,y-this.y
  var v_y = y - this.y;
  var sin = Math.sin(this.rotate * -1);
  var cos = Math.cos(this.rotate * -1);
  var r_x = v_x * cos + v_y * sin; //v_x * sin - v_y * cos;
  var r_y = v_y * cos - v_x * sin; //v_x * cos - v_y * sin;
  //console.log(`(${r_x},${r_y})`);
  if (
    -a <= r_x &&
    r_x - a <= this.width &&
    -a <= r_y &&
    r_y - a <= this.height
  ) {
    return true;
  }
  return false;
};
/**
 * @function hit
 * @description detect if get square obj get hit
 * @param {square,vector,Number} inp - plane that hit by
 * @param {Number} y - fool-proof design(useless)
 */
square.prototype.hit = function (inp, y) {
  if (y) {
    return this.isIn(inp, y);
  }
  var pg1 = this.listPoint();
  var pg2 = inp.listPoint();
  var facility = [
    this.rotate,
    this.rotate + 0.5 * Math.PI,
    inp.rotate,
    inp.rotate + 0.5 * Math.PI,
  ];
  for (var i = 0; i < 4; i++) {
    var sin = Math.sin(facility[i]);
    var cos = Math.cos(facility[i]);
    var result1 = new Array();
    for (const content of pg1) {
      result1.push(content.x * sin + content.y * cos);
    }
    result1.sort(function (a, b) {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    });
    var result2 = new Array();
    for (const content of pg2) {
      result2.push(content.x * sin + content.y * cos);
    }
    result2.sort(function (a, b) {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    });

    //console.log(result1);
    //console.log(result2);
    //console.log("!")

    if (result1[0] > result2[0]) {
      if (result2[3] < result1[0]) {
        return false;
      }
    } else {
      if (result1[3] < result2[0]) {
        return false;
      }
    }
    //sin*x+cos*y
  }
  return true;
};

/**
 * @function listPoint
 * @description list four point of the square
 * @returns {Array} - a array of points
 */
square.prototype.listPoint = function () {
  var m1 = {
    x: Math.cos(+this.rotate) * this.width,
    y: Math.sin(+this.rotate) * this.width,
  };
  var m2 = {
    x: Math.cos(Math.PI * 0.5 + this.rotate) * this.height,
    y: Math.sin(Math.PI * 0.5 + this.rotate) * this.height,
  };
  return [
    {
      x: this.x,
      y: this.y,
    },
    {
      x: this.x + m1.x,
      y: this.y + m1.y,
    },
    {
      x: this.x + m2.x,
      y: this.y + m2.y,
    },
    {
      x: this.x + m1.x + m2.x,
      y: this.y + m1.y + m2.y,
    },
  ];
};
/**
 * @function toward
 * @description It's different form wrap, toward won't ignore the bounceList and push others
 * @param {Number} pixel - repersent the path length would move
 * @param {Number} rad - direction the move toward
 */
square.prototype.toward = function (pixel, rad) {
  //org

  var vec = new cal.line(rad, this.x, thix.y);
  this.VEtoward(vec);
};
/**
 * @function VEtoward
 * @description
 * @param {vector} vec
 */
square.prototype.VEtoward = function (line) {
  var sin = Math.sin(line.rad);
  var cos = Math.cos(line.rad);
  var l1 = line;
  var l2 = line;
  l2.x += this.width * cos;
  l2.y += this.width * sin;
  var l3 = line;
  l3.x += this.height * cos;
  l3.y += this.height * sin;
  var l4 = line;
  l3.x += this.width * cos + this.height * cos;
  l3.y += this.width * sin + this.height * sin;
  var pro_arr = [l1, l2, l3, l4];
  pro_arr = pro_arr.map((x) => x.cross(this));
  //error:the cross target isn't 'this', should be the square in the bounce list, and forEach the bounce list
  //and don't forget to mark the distant;
  var temp = [];
  pro_arr.forEach((ele) => {
    if (ele.length != 0) {
      temp.push(ele);
    }
  });
  pro_arr = temp;
  //delete temp;
};
/**
 * @function wrap
 * @description It's different form toward, toward will ignore the bounceList and not push others
 * @param {*} pixel - repersent the path length would move
 * @param {*} rad - direction the face
 */
square.prototype.wrap = function (pixel, rad) {
  var sin = Math.sin(rad);
  var cos = Math.cos(rad);
  this.x += cos * pixel;
  this.y += sin * pixel;
};

function vector(content) {
  this.x = content.x || -1;
  this.y = content.y || -1;
  this.rad = content.rad || 0;
  this.len = content.len || 0;
}

function comp_fun(rad, x, y) {
  //ax+by=c
  //x sin + y cos = k
  this.rad = rad;
  this.a = Math.sin(rad);
  this.b = Math.cos(rad);
  this.c = this.a * x + this.b * y;
}
comp_fun.prototype.cross = function (inp) {
  return {
    x: (inp.b * this.c - this.b * inp.c) / (inp.b * this.a - this.b - inp.a),
    y: (inp.a * this.c - this.a * inp.c) / (inp.a * this.b - this.a - inp.a),
  };
};

function f_square(content) {
  this.x = content.x || -1;
  this.y = content.y || -1;
  this.rotate = content.rotate || 0;
  this.height = content.height || 0;
  this.width = content.width || 0;
}
f_square.prototype.listPoint = function () {
  var m1 = {
    x: Math.cos(+this.rotate) * this.width,
    y: Math.sin(+this.rotate) * this.width,
  };
  var m2 = {
    x: Math.cos(Math.PI * 0.5 + this.rotate) * this.height,
    y: Math.sin(Math.PI * 0.5 + this.rotate) * this.height,
  };
  return [
    {
      x: this.x,
      y: this.y,
    },
    {
      x: this.x + m1.x,
      y: this.y + m1.y,
    },
    {
      x: this.x + m2.x,
      y: this.y + m2.y,
    },
    {
      x: this.x + m1.x + m2.x,
      y: this.y + m1.y + m2.y,
    },
  ];
};
vector.prototype.height = 0;
vector.prototype.listPoint = function () {
  return [
    {
      x: this.x,
      y: this.y,
    },
    {
      x: this.x + Math.cos(this.rad) * this.len,
      y: this.y + Math.sin(this.rad) * this.len,
    },
  ];
};
Object.defineProperty(vector.prototype, "width", {
  get: function () {
    return this.len;
  },
  set: function (inp) {
    this.len = inp;
  },
});

var debug_index;
var log = `execute "debug()"!`;

function debug() {
  debug_index = new square(
    new PIXI.Sprite(PIXI.Texture.from("resource/debug/orange.png"))
  );
  document.addEventListener("click", function (event) {
    //console.log("!");
    log = `(${event.clientX},${event.clientY})`;
    debug_index.x = event.clientX;
    debug_index.y = event.clientY;
  });
}
//blue.bounceList.push({self:red,bounce:-1})
//blue.toward(200,Math.PI*0.25)
var cal = {};
cal.point = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};
cal.line = function (rad, x, y, len) {
  this.lit = false;
  if (x) {
    this.pos = "abs";
    this.x = x;
    this.y = y;
    if (len) {
      this.len = len;
      this.lit = true;
    }
  } else {
    this.pos = "rel";
  }
};

cal.line.prototype.cross = function (inp) {
  if (inp instanceof square) {
    var por_arr = inp.listPoint().map((inp) => new cal.point(inpx.x, inp.y));
    if ((this.pos = "rel")) throw new Error("not supported!");
    por_arr = por_arr.map((x) => this.cross(x));
    por_arr = por_arr.filter((x) => inp.isIn(x.x, x.y, 0.1));
    por_arr = por_arr.map((inpo) => {
      var ele = inpo;
      inpo.cp = Math.abs(ele.x - this.x + ele.y - this.y);
      return inpo;
    });
    por_arr.sort(function (a, b) {
      return a.cp > b.cp ? 1 : -1;
    });
    return por_arr;
  } else if (inp instanceof line) {
    if ((inp.pos = "rel")) throw new Error("can not use rel pos to cross!");

    var fun1 = {};
    var fun2 = {};
    fun1.a = Math.sin(inp.rad);
    fun1.b = Math.cos(inp.rad);
    fun1.c = -(fun1.a * inp.x + fun1.b * inp.y);
    //fun1=ax+by+c=0
    fun2.a = Math.sin(this.rad);
    fun2.b = Math.cos(this.rad);
    fun2.c = -(fun2.a * this.x + fun2.b * this.y);
    //fun2=ax+by+c=0
    var x =
      (fun1.b * fun2.c - fun1.c * fun1.a) / (fun1.a * fun2.b - fun1.b * fun2.a);
    var y =
      (fun1.a * fun2.c - fun1.c * fun1.b) / (fun1.b * fun2.a - fun1.a * fun2.b);
    return new cal.point(x, y);
  }
};

// exports= square;
//module.exports=square;
// export const square_ =square;