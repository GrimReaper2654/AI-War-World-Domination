/*
-----------------------------------------Balancing-----------------------------------------
8/8/2023
 • start of changelog


-------------------------------------------------------------------------------------------
*/

// The support functions that might not be necessary
function isin(a, b) { // check is a in b
    for (var i = 0; i < b.length; i += 1) {
        if (a == b[i]) {
            return true;
        }
    }
    return false;
};

function randchoice(list, remove = false) { // chose 1 from a list and update list
    let length = list.length;
    let choice = randint(0, length-1);
    if (remove) {
        let chosen = list.splice(choice, 1);
        return [chosen, list];
    }
    return list[choice];
};

function randint(min, max, notequalto=false) { // Randint returns random interger between min and max (both included)
    if (max - min <= 1) {
        return min;
    }
    var gen = Math.floor(Math.random() * (max - min + 1)) + min;
    var i = 0; // 
    while (gen != min && gen != max && notequalto && i < 100) { // loop max 100 times
        gen = Math.floor(Math.random() * (max - min + 1)) + min;
        i += 1;
        console.log('calculating...');
    }
    if (i >= 100) {
        console.log('ERROR: could not generate suitable number');
    }
    return gen;
};

function replacehtml(text) {
    document.getElementById("game").innerHTML = text;
};

function addImage(img, x, y, cx, cy, scale, r, absolute, opacity=1) {
    var c = document.getElementById('main');
    var ctx = c.getContext("2d");
    ctx.globalAlpha = opacity;
    if (absolute) {
        ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        ctx.rotate(r);
        ctx.drawImage(img, -cx, -cy);
    } else {
        ctx.setTransform(scale, 0, 0, scale, x-player.x+display.x/2, y-player.y+display.y/2); // position relative to player
        ctx.rotate(r);
        ctx.drawImage(img, -cx, -cy);
    }
    ctx.globalAlpha = 1.0;
};

function clearCanvas() {
    var c = document.getElementById('main');
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, display.x, display.y);
    ctx.restore();
};

function drawLine(pos, r, length, style, absolute) {
    var c = document.getElementById("main");
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (style) {
        ctx.strokeStyle = style.colour;
        ctx.lineWidth = style.width;
        ctx.globalAlpha = style.opacity;
    }
    ctx.beginPath();
    if (absolute) {
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + length * Math.cos(r), pos.y + length * Math.sin(r));
    } else {
        ctx.moveTo(pos.x-player.x+display.x/2, pos.y-player.y+display.y/2);
        ctx.lineTo(pos.x-player.x+display.x/2 + length * Math.cos(r), pos.y-player.y+display.y/2 + length * Math.sin(r));
    }
    ctx.stroke();
    ctx.restore();
};

function sufficient(ability, cargo) {
    var sufficient = true
    for (var i=0; i < Object.keys(ability.cost).length; i += 1) {
        if (cargo[Object.keys(ability.cost)[i]] < ability.cost[Object.keys(ability.cost)[i]]) {
            sufficient = false;
        }
    }
    if (sufficient) {
        if (ability.reload) {
            ability.reload = ability.reloadTime;
        }
        for (var i=0; i < Object.keys(ability.cost).length; i += 1) {
            cargo[Object.keys(ability.cost)[i]] -= ability.cost[Object.keys(ability.cost)[i]];
        }
    }
    return [sufficient, ability, cargo];
};

function getDist(sPos, tPos) { 
    // Mathematics METHods
    var dx = tPos.x - sPos.x;
    var dy = tPos.y - sPos.y;
    var dist = Math.sqrt(dx*dx+dy*dy);
    return dist;
};

function correctAngle(a) {
    a = a%(Math.PI*2);
    if (a > Math.PI) {
        a = -(2*Math.PI-a);
    } else if (a < -Math.PI) {
        a = (2*Math.PI+a);
    }
    return a;
};

function roman(number) {
    if (number <= 0 || number >= 4000) {
        var symbols = ['0','1','2','3','4','5','6','7','8','9','¡','£','¢','∞','§','¶','œ','ß','∂','∫','∆','√','µ','†','¥','ø'];
        return `${randchoice(symbols)}${randchoice(symbols)}${randchoice(symbols)}`;
    }
    
    const romanNumerals = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    
    let romanNumeral = '';
    
    for (let key in romanNumerals) {
        while (number >= romanNumerals[key]) {
            romanNumeral += key;
            number -= romanNumerals[key];
        }
    }
    console.log(romanNumeral);
    return romanNumeral;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function drawCircle(x, y, radius, fill, stroke, strokeWidth, opacity=1) { // draw a circle
    var canvas = document.getElementById('main');
    var ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
};

function drawLight(x, y, radius) {
    var canvas = document.getElementById('main');
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;

    ctx.fill();
};

function detectCollision(obj1, obj2) { // Should detect collisions even when stuff goes really fast TODO: might need reworking
    for (var i = 0; i < obj1.hitbox.length; i += 1) {
        for (var j = 0; j < obj2.hitbox.length; j += 1) {
            var steps = Math.abs(obj1.v) / obj1.hitbox[0].r;
            if (steps <= 1) {
                steps = 1;
            }
            for (var step = 0; step < steps; step += 1) {
                if (getDist({x: obj1.hitbox[i].px+obj1.vx*(step/steps), y: obj1.hitbox[i].py+obj1.vy*(step/steps)},{x: obj2.hitbox[j].x, y: obj2.hitbox[j].y}) < obj1.hitbox[i].r + obj2.hitbox[j].r) {
                    return [true,{x: obj1.hitbox[i].px+obj1.vx*(step/steps), y: obj1.hitbox[i].py+obj1.vy*(step/steps)}];
                }
            }
            if (getDist({x: obj1.hitbox[i].x, y: obj1.hitbox[i].y},{x: obj2.hitbox[j].x, y: obj2.hitbox[j].y}) < obj1.hitbox[i].r + obj2.hitbox[j].r) {
                return [true,{x: obj1.hitbox[i].x, y: obj1.hitbox[i].y}];
            }
        }
    }
    return false;
};

function calculateDamage(bullet, ship) { // TODO: Might need reworking
    if (bullet.dmg > 0 && bullet.team != ship.team) {
        if (bullet.dmg > ship.shield.shieldCap) {
            bullet.dmg -= ship.shield.shield*(ship.shield.shield/bullet.dmg);
            ship.shield.shield = 0;
            ship.shield.cooldown = 300;
        } else {
            if (bullet.dmg < ship.shield.shield*0.1) {
                ship.shield.shield -= bullet.dmg/2;
                bullet.dmg = 0;
            } else if (bullet.dmg < ship.shield.shield*0.75) {
                ship.shield.shield -= bullet.dmg;
                bullet.dmg = 0;
                ship.shield.cooldown += 5;
            } else {
                bullet.dmg -= ship.shield.shield*0.75;
                ship.shield.shield *= 0.25;
                ship.shield.cooldown += 15;
            }
        }
        if (ship.shield.cooldown > 300) {
            ship.shield.cooldown = 300;
        }
        if (ship.shield.shield < 0) {
            ship.shield.shield = 0;
        }
        if (bullet.dmg < 0) {
            bullet.dmg = 0;
        }
        if (ship.upgrades) {
            if (ship.upgrades[19]) {
                bullet.dmg *= (1-(ship.upgrades[19].level-1)*0.1);
            }
        }
        ship.hp -= bullet.dmg;
        if (0-ship.hp > bullet.dmg*0.5) {
            bullet.v *= (0-ship.hp)/bullet.dmg;
            bullet.dmg = 0-ship.hp;
        } else {
            bullet.dmg = 0;
        }
    }
    return [bullet, ship];
};

function bar(image, pos, size, step) {
    for (var i = 0; i < size; i += 1) {
        addImage('main', data.img[image], pos.x+i*step, pos.y, data.dim[image].x, data.dim[image].x, 1, 0)
    }
};

function healthBar(size, ship, step) {
    var length = size * step;
    var pos = {x: ship.x-length/2, y: ship.y + data.center[ship.type].y*1.5};
    var top = Math.round(ship.shield.shield / ship.shield.shieldCap * size);
    var bottom = Math.round(ship.hp / data.construction[ship.type].hp * size);
    bar('GREYCIRCLE', pos, size, step);
    bar('BLUECIRCLE', pos, top, step);
    bar('SILVERCIRCLE', pos, bottom, step);
};

function PlayerUiBar(level, max, pos, dim, fillColour, border) {
    var c = document.getElementById("main");
    var ctx = c.getContext("2d");

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (border != -1) {
        ctx.fillStyle = '#696969';
        ctx.fillRect(pos.x, pos.y, dim.x, dim.y);
    } else {
        border = 0;
    }
  
    const fillPercentage = level / max;
    ctx.fillStyle = fillColour;
    ctx.fillRect(pos.x+border, pos.y+border, fillPercentage * (dim.x-border*2), dim.y-border*2);

    ctx.restore();
};

function grid(spacing) { // TODO: update colours
    var start = (player.y - display.y / 2) < 0 ? Math.ceil((player.y - display.y / 2) / spacing) * spacing : Math.floor((player.y - display.y / 2) / spacing) * spacing - spacing * 2;
    var end = (player.y + display.y / 2) < 0 ? Math.ceil((player.y + display.y / 2) / spacing) * spacing : Math.floor((player.y + display.y / 2) / spacing) * spacing + spacing * 2;
    for (let i = start; i <= end; i += spacing) {
        drawLine({x:(player.x - display.x / 2) - spacing,y:i}, r=0, display.x+spacing*2, {colour:'#999999',width:10,opacity:0.1});
    }
    start = (player.x - display.x / 2) < 0 ? Math.ceil((player.x - display.x / 2) / spacing) * spacing : Math.floor((player.x - display.x / 2) / spacing) * spacing - spacing * 2;
    end = (player.x + display.x / 2) < 0 ? Math.ceil((player.x + display.x / 2) / spacing) * spacing : Math.floor((player.x + display.x / 2) / spacing) * spacing + spacing * 2;
    for (var i = start; i < end; i += spacing) {
        drawLine({x:i,y:(player.y - display.y / 2) -spacing}, r=Math.PI/2, display.y+spacing*2, {colour:'#999999',width:10,opacity:0.1});
    }
};

function displaytxt(txt, pos, font, fill) {
    var canvas = document.getElementById("main");
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Set the font and text color
    ctx.font = font;
    ctx.fillStyle = fill;
  
    // Display the points on the canvas
    ctx.fillText(txt, pos.x, pos.y);

    ctx.stroke();
    ctx.restore();
};

function drawExplosions(explosion) {
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, explosion.r, '#fccbb1', '#f7b28d', 0.1, 0.5*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, explosion.r, false, '#f7b28d', 5, 0.5);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-20, 0), false, '#fcd8d2', 20, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-15, 0), false, '#fcd8d2', 15, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-10, 0), false, '#fcd8d2', 10, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-5, 0), false, '#fcd8d2', 5, 0.3*explosion.transparancy);
    drawLight(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2,explosion.maxR+explosion.r/2);
    if (explosion.r >= explosion.maxR) {
        explosion.transparancy *=0.9;
        explosion.r*=1.1;
    }
    if (explosion.transparancy > 0.25) {
        handleMotion(explosion);
        explosion.r += 2;
        if (explosion.r > explosion.maxR) {
            explosion.r = explosion.maxR;
        }
        return explosion;
    }
    return false;
};

// The return of the excessively overcomplicated data storage system
var prototypedata = {
    player: {

    }
}
const data = JSON.parse(JSON.stringify(prototypedata));

// Loading savegames TODO: add saving entire game not just player
var player = {};
//localStorage.removeItem('player');
var savedPlayer = localStorage.getItem('player');
if (savedPlayer !== null) {
    console.log('loading previous save');
    player = JSON.parse(savedPlayer);
    console.log(savedPlayer);
} else {
    // No saved data found
    console.log('no save found, creating new player');
    player = data.player;
    player.keyboard = [];
    player.hasClicked = 0;
}

// Steal Data (get inputs)
window.onkeyup = function(e) { player.keyboard[e.key] = false; }
window.onkeydown = function(e) { player.keyboard[e.key] = true; }
document.addEventListener('mousedown', function(event) {
  if (event.button === 0) { // Check if left mouse button was clicked
    player.hasClicked = true;
  }
});
document.addEventListener('mouseup', function(event) {
  if (event.button === 0) { // Check if left mouse button was released
    player.hasClicked = false;
  }
});
window.addEventListener("resize", function () {
    if (t > 0) {
        display = {x:window.innerWidth,y:window.innerHeight};
        replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas><canvas id="explosion" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas><canvas id="bombers" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas><canvas id="canvasOverlay" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas>`);
    }
});
function tellPos(p){
    mousepos = {x: p.pageX, y:p.pageY};
};
window.addEventListener('mousemove', tellPos, false);
var buttons = document.getElementsByClassName('button');

// Game related stuff
function load() {
    console.log('Startin the game...');
    replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas><canvas id="canvasOverlay" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0;"></canvas>`);
    game();
};

function handleInputs(player) { // TODO: Needs to be recoded (literally coppied from SSG)
    if (player.keyboard.w) { 
        player.a += player.thrust*2; 
    }
    if (player.keyboard.s) {
        player.a -= player.thrust*2;
        if (player.a < -player.terminalAcceleration/4) {
            player.a = -player.terminalAcceleration/4;
        }
    }
    if (player.keyboard.a) { 
        player.r -= player.agi;
        if (player.r >= 2*Math.PI) {
            player.r -= Math.PI*2;
        } else if (player.r <= -2*Math.PI) {
            player.r += Math.PI*2;
        }
    }
    if (player.keyboard.d) { 
        player.r += player.agi;
        if (player.r >= 2*Math.PI) {
            player.r -= Math.PI*2;
        } else if (player.r <= -2*Math.PI) {
            player.r += Math.PI*2;
        }
    }
    
    for (var i = 0; i < player.weapons.length; i+=1) {
        if (player.weapons[i].keybind == CLICK) {
            if (player.hasClicked) {
                player = attemptShoot(i, player);
            }
        } else {
            if (player.keyboard[player.weapons[i].keybind]) {
                player = attemptShoot(i, player);
            }
        }
    }
    return player;
};

function main() {

}