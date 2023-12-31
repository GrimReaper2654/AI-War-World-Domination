/*
-----------------------------------------Balancing-----------------------------------------
8/8/2023
 • start of changelog

27/8/2023
 • actually started development

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

function clearCanvas(canvas) {
    var c = document.getElementById(canvas);
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
    return a;
};

function rotateAngle(r, rTarget, increment) {
    if (Math.abs(r) > Math.PI*4 || Math.abs(rTarget) > Math.PI*4) {
        throw "Error: You f*cked up the angle thing again...";
    }
    if (r == rTarget) {
        return correctAngle(r);
    }else if (rTarget - r <= Math.PI && rTarget - r > 0) {
        if (rTarget - r < increment) {
            r = rTarget;
        } else {
            r += increment;
        }
        return r;
    } else if (r - rTarget < Math.PI && r - rTarget > 0) {
        if (r - rTarget < increment) {
            r = rTarget;
        } else {
            r -= increment;
        }
        return correctAngle(r);
    } else {
        if (r < rTarget) {
            r += Math.PI*2;
        } else {
            rTarget += Math.PI*2;
        }
        return correctAngle(rotateAngle(r, rTarget, increment));
    }
};

function aim(initial, final) {
    if (initial == final) { 
        return 0;
    }
    let diff = {x: final.x - initial.x, y: initial.y - final.y};
    if (diff.x == 0) {
        if (diff.y > 0) {
            return 0;
        } else {
            return Math.PI;
        }
    } else if (diff.y == 0) {
        if (diff.x > 0) {
            return Math.PI/2;
        } else {
            return 3*Math.PI/2;
        }
    }
    let angle = Math.atan(Math.abs(diff.y / diff.x));
    if (diff.x > 0 && diff.y > 0) {
        return Math.PI/2 - angle;
    } else if (diff.x > 0 && diff.y < 0) {
        return Math.PI/2 + angle;
    } else if (diff.x < 0 && diff.y < 0) {
        return 3*Math.PI/2 - angle;
    } else {
        return 3*Math.PI/2 + angle;
    }
};

function toComponent(m, r) {
    return {x: m * Math.sin(r), y: -m * Math.cos(r)};
};

function offsetPoints(points, offset) {
    for (let i = 0; i < points.length; i++){
        points[i].x += offset.x;
        points[i].y += offset.y;
    }
    return points;
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
    return romanNumeral;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function toColour(colour) {
    return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
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

function displaytxt(txt, pos) {
    var canvas = document.getElementById("canvasOverlay");
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Set the font and text color
    ctx.font = "20px Verdana";
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    // Display the points on the canvas
    ctx.fillText(txt, pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
};

function drawPolygon(point, offset, r, fill, stroke, absolute, debug=false) {
    let points = JSON.parse(JSON.stringify(point));
    if (points.length < 3) {
        throw "Error: Your polygon needs to have at least 3 points dumbass";
    }
    if (r != false) {
        for (let i = 0; i < points.length; i++) {
            points[i].x = point[i].x * Math.cos(r) - point[i].y * Math.sin(r); 
            points[i].y = point[i].x * Math.sin(r) + point[i].y * Math.cos(r); 
        }
    }
    var canvas = document.getElementById('main');
    var ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.beginPath();
    if (absolute) {
        ctx.moveTo(points[0].x + offset.x, points[0].y + offset.y);
        if (debug) {displaytxt(`(${Math.round(points[0].x + offset.x)}, ${Math.round(points[0].y + offset.y)})`, {x: points[0].x + offset.x, y: points[0].y + offset.y});}
    } else {
        ctx.moveTo(points[0].x-player.x+display.x/2 + offset.x, points[0].y-player.y+display.y/2 + offset.y);
        if (debug) {displaytxt(`(${Math.round(points[0].x + offset.x)}, ${Math.round(points[0].y + offset.y)})`, {x: points[0].x-player.x+display.x/2 + offset.x, y: points[0].y-player.y+display.y/2 + offset.y});}
        //if (debug) {displaytxt(`(${Math.round(points[0].x-player.x+display.x/2 + offset.x)}, ${Math.round(points[0].y-player.y+display.y/2 + offset.y)})`, {x: points[0].x-player.x+display.x/2 + offset.x, y: points[0].y-player.y+display.y/2 + offset.y});}
    }
    for (let i = 1; i < points.length; i++) {
        if (absolute) {
            ctx.lineTo(points[i].x + offset.x, points[i].y + offset.y);
            if (debug) {displaytxt(`(${Math.round(points[i].x + offset.x)}, ${Math.round(points[i].y + offset.y)})`, {x: points[i].x + offset.x, y: points[i].y + offset.y});}
        } else {
            ctx.lineTo(points[i].x-player.x+display.x/2 + offset.x, points[i].y-player.y+display.y/2 + offset.y);
            if (debug) {displaytxt(`(${Math.round(points[i].x + offset.x)}, ${Math.round(points[i].y + offset.y)})`, {x: points[i].x-player.x+display.x/2 + offset.x, y: points[i].y-player.y+display.y/2 + offset.y});}
            //if (debug) {displaytxt(`(${Math.round(points[i].x-player.x+display.x/2 + offset.x)}, ${Math.round(points[i].y-player.y+display.y/2 + offset.y)})`, {x: points[i].x-player.x+display.x/2 + offset.x, y: points[i].y-player.y+display.y/2 + offset.y});}
        }
    }
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.colour;
        ctx.stroke();
    }
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
        drawLine({x:(player.x - display.x / 2) - spacing,y:i}, r=0, display.x+spacing*2, {colour:'#999999',width:5,opacity:0.5});
    }
    start = (player.x - display.x / 2) < 0 ? Math.ceil((player.x - display.x / 2) / spacing) * spacing : Math.floor((player.x - display.x / 2) / spacing) * spacing - spacing * 2;
    end = (player.x + display.x / 2) < 0 ? Math.ceil((player.x + display.x / 2) / spacing) * spacing : Math.floor((player.x + display.x / 2) / spacing) * spacing + spacing * 2;
    for (var i = start; i < end; i += spacing) {
        drawLine({x:i,y:(player.y - display.y / 2) -spacing}, r=Math.PI/2, display.y+spacing*2, {colour:'#999999',width:5,opacity:0.5});
    }
};

function drawExplosions(explosion) {
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, explosion.r, '#fccbb1', '#f7b28d', 0.1, 0.5*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, explosion.r, false, '#f7b28d', 5, 0.5);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-20, 0), false, '#fcd8d2', 20, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-15, 0), false, '#fcd8d2', 15, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-10, 0), false, '#fcd8d2', 10, 0.3*explosion.transparancy);
    drawCircle(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, Math.max(explosion.r-5, 0), false, '#fcd8d2', 5, 0.3*explosion.transparancy);
    drawLight(explosion.x-r-player.x+display.x/2, explosion.y-r-player.y+display.y/2, explosion.maxR+explosion.r/2);
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

function normalDistribution(mean, sDiv) {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); 
    while (v === 0) v = Math.random(); 
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sDiv;
};

function raySegmentIntersection(ray, segment) {
    console.log(ray, segment);
    if (segment.start.x > segment.end.x) {
        console.log('invert');
        let s = JSON.parse(JSON.stringify(segment.start));
        let e = JSON.parse(JSON.stringify(segment.end));
        segment.start = e;
        segment.end = s;
    }
    console.log(segment);
    if (ray.x < segment.start.x || ray.x > segment.end.x || ray.y > segment.end.y) {
        console.log('no');
        return false;
    }
    let diff = {x: segment.start.x - segment.end.x, y: segment.start.y - segment.end.y};
    if (((ray.x - segment.start.x) / diff.x ) * diff.y + segment.start.y > ray.y) {
        console.log('yes');
        return true;
    }
    console.log('no');
    return false;
};

function pointInPolygon(point, polygon) {
    let inside = false;
    if (raySegmentIntersection(point, {start: polygon[0], end: polygon[polygon.length-1]})) {
        inside = !inside;
    }
    for (let i = 1; i < polygon.length-1; i++) {
        if (raySegmentIntersection(point, {start: polygon[i], end: polygon[i+1]})) {
            inside = !inside;
        }
    }
    //console.log(inside);
    return inside;
};

function vMath(v1, v2, mode) {
    switch (mode) {
        case 'add':
            return {x: v1.x+v2.x, y: v1.y+v2.y};
        case 'subtract':
            return {x: v1.x-v2.x, y: v1.y-v2.y};
        case 'multiply': // v2 is now a scalar
            return {x: v1.x*v2, y: v1.y*v2};
        case 'divide': // v2 is now a scalar
            return {x: v1.x/v2, y: v1.y/v2};
        default:
            throw 'are you f*cking retarded?';
    }
};

// The return of the excessively overcomplicated data storage system
const data = {
   mech: {
        x: 0,
        y: 0,
        r: 0, // direction of motion
        vx: 0,
        vy: 0,
        mouseR: 0, // current Aim
        lastMoved: 69,
        v: 2, // normal walking speed
        vr: 180 / 60 / 180 * Math.PI, // rotation of tracks (feet)
        tr: 360 / 60 / 180 * Math.PI, // rotation of turret (main body)
        keyboard: [],
        aimPos: {x: 69, y: 69},
        collisionR: 150,
        directControl: false,
        parts: [
            {
                id: 'LowerBodyContainer',
                facing: 'body',
                type: 'circle', 
                rOffset: 0,
                size: 35,
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(140, 140, 140, 1)',
                    stroke: {colour: '#696969', width: 5},
                },
                collision: true,
                hp: 500,
                isHit: 0,
                connected: [
                    {
                        id: 'foot1',
                        type: 'polygon', 
                        facing: 'body',
                        rOffset: 0,
                        size: [
                            {x: -10, y: 60},
                            {x: 10, y: 60},
                            {x: 15, y: 50},
                            {x: 15, y: -50},
                            {x: 10, y: -60},
                            {x: -10, y: -60},
                            {x: -15, y: -50},
                            {x: -15, y: 50},
                        ],
                        offset: {x: -30, y: -5},
                        style: {
                            fill: 'rgba(130, 130, 130, 1)',
                            stroke: {colour: '#696969', width: 5},
                        },
                        collision: false,
                        hp: Infinity,
                        isHit: 0,
                        connected: [],
                    },
                    {
                        id: 'foot2',
                        facing: 'body',
                        type: 'polygon', 
                        rOffset: 0,
                        size: [
                            {x: -10, y: 60},
                            {x: 10, y: 60},
                            {x: 15, y: 50},
                            {x: 15, y: -50},
                            {x: 10, y: -60},
                            {x: -10, y: -60},
                            {x: -15, y: -50},
                            {x: -15, y: 50},
                        ],
                        offset: {x: 30, y: -5},
                        style: {
                            fill: 'rgba(130, 130, 130, 1)',
                            stroke: {colour: '#696969', width: 5},
                        },
                        collision: false,
                        hp: Infinity,
                        isHit: 0,
                        connected: [],
                    },
                    {
                        id: 'lowerBody',
                        facing: 'body',
                        type: 'circle', 
                        rOffset: 0,
                        size: 35,
                        offset: {x: 0, y: 0},
                        style: {
                            fill: 'rgba(140, 140, 140, 1)',
                            stroke: {colour: '#696969', width: 5},
                        },
                        collision: false,
                        hp: Infinity,
                        isHit: 0,
                        connected: [],
                    },
                ],
                groundCollision: true,
            },
            {
                id: 'mainBody',
                facing: 'turret',
                type: 'polygon', 
                rOffset: 0,
                size: [
                    {x: -60, y: 40},
                    {x: 60, y: 40},
                    {x: 70, y: 30},
                    {x: 70, y: -30},
                    {x: 60, y: -40},
                    {x: -60, y: -40},
                    {x: -70, y: -30},
                    {x: -70, y: 30},
                ],
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(210, 210, 210, 1)',
                    stroke: {colour: '#696969', width: 10},
                },
                collision: true,
                hp: 5000,
                collideDmg: 500,
                isHit: 0,
                connected: [
                    {
                        id: 'armLeft',
                        facing: 'turret',
                        type: 'polygon', 
                        rOffset: 0,
                        size: [
                            {x: -20, y: 50},
                            {x: 20, y: 50},
                            {x: 25, y: 40},
                            {x: 25, y: -60},
                            {x: 20, y: -70},
                            {x: -20, y: -70},
                            {x: -25, y: -60},
                            {x: -25, y: 40},
                        ],
                        offset: {x: -100, y: 0},
                        style: {
                            fill: 'rgba(200, 200, 200, 1)',
                            stroke: {colour: '#696969', width: 10},
                        },
                        collision: true,
                        hp: 3000,
                        collideDmg: 500,
                        isHit: 0,
                        connected: [
                            {
                                id: 'gunLeft',
                                facing: 'turret',
                                type: 'polygon', 
                                rOffset: 0,
                                size: [
                                    {x: -10, y: 0},
                                    {x: 10, y: 0},
                                    {x: 10, y: 30},
                                    {x: -10, y: 30},
                                ],
                                offset: {x: -100, y: -100},
                                style: {
                                    fill: 'rgba(150, 150, 150, 1)',
                                    stroke: {colour: '#696969', width: 5},
                                },
                                cannon: {
                                    keybind: 'click',
                                    x: 0,
                                    y: 0,
                                    reload: {c: 0, t: 15},
                                    spread: Math.PI/48/10,
                                    bullet: {
                                        type: 'circle', 
                                        size: 8,
                                        style: {
                                            fill: {r: 100, g: 100, b: 100, a: 1},
                                            stroke: {colour: {r: 69, g: 69, b: 69, a: 1}, width: 3},
                                        },
                                        decay: {
                                            life: 120, 
                                            fillStyle: {r: 0, g: 0, b: 0, a: 0}, 
                                            strokeStyle: {r: 0, g: 0, b: 0, a: 0}, 
                                            size: 1
                                        },
                                        dmg: 250,
                                        v: 20,
                                        vDrag: 0.99,
                                    },
                                },
                                collision: false,
                                hp: Infinity,
                                isHit: 0,
                                connected: [],
                            },
                        ],
                    },
                    {
                        id: 'armRight',
                        facing: 'turret',
                        type: 'polygon', 
                        rOffset: 0,
                        size: [
                            {x: -20, y: 50},
                            {x: 20, y: 50},
                            {x: 25, y: 40},
                            {x: 25, y: -60},
                            {x: 20, y: -70},
                            {x: -20, y: -70},
                            {x: -25, y: -60},
                            {x: -25, y: 40},
                        ],
                        offset: {x: 100, y: 0},
                        style: {
                            fill: 'rgba(200, 200, 200, 1)',
                            stroke: {colour: '#696969', width: 10},
                        },
                        collision: true,
                        hp: 3000,
                        collideDmg: 500,
                        isHit: 0,
                        connected: [
                            {
                                id: 'gunRight',
                                facing: 'turret',
                                type: 'polygon', 
                                rOffset: 0,
                                size: [
                                    {x: -10, y: 0},
                                    {x: 10, y: 0},
                                    {x: 10, y: 30},
                                    {x: -10, y: 30},
                                ],
                                offset: {x: 100, y: -100},
                                style: {
                                    fill: 'rgba(150, 150, 150, 1)',
                                    stroke: {colour: '#696969', width: 5},
                                },
                                cannon: {
                                    keybind: 'click',
                                    x: 0,
                                    y: 0,
                                    reload: {c: 0, t: 15},
                                    spread: Math.PI/48,
                                    bullet: {
                                        type: 'circle', 
                                        size: 8,
                                        style: {
                                            fill: {r: 100, g: 100, b: 100, a: 1},
                                            stroke: {colour: {r: 69, g: 69, b: 69, a: 1}, width: 3},
                                        },
                                        decay: {
                                            life: 120, 
                                            fillStyle: {r: 0, g: 0, b: 0, a: 0}, 
                                            strokeStyle: {r: 0, g: 0, b: 0, a: 0}, 
                                            size: 1
                                        },
                                        dmg: 250,
                                        v: 20,
                                        vDrag: 0.99,
                                    },
                                },
                                collision: false,
                                hp: Infinity,
                                isHit: 0,
                                connected: [],
                            },
                        ],
                    },
                    {
                        id: 'head',
                        facing: 'turret',
                        type: 'circle', 
                        rOffset: 0,
                        size: 25,
                        offset: {x: 0, y: 0},
                        style: {
                            fill: 'rgba(69, 69, 69, 1)',
                            stroke: {colour: '#696969', width: 5},
                        },
                        collision: false,
                        hp: Infinity,
                        isHit: 0,
                        connected: [],
                    },
                ],
            },
        ],
    },
    template: {
        physics: {
            x: 0,     // x coordinate
            y: 0,     // y coordinate
            vx: 0,    // x component of velocity
            vy: 0,    // y component of velocity
            ax: 0,    // x component of acceleration
            ay: 0,    // y component of acceleration
            r: 0,     // rotation
            vr: 0,    // angular velocity
            ar: 0,    // angular acceleration
            vDrag: 1, // drag (multiply by velocities to slow them down)
            rDrag: 1, // angular drag (multiply by velocities to slow them down)
            maxV: 25, // terminal velocity (25pixels/tick)
            maxRV: Math.PI/15, // terminal angular velocity (720˚/second)
        },
        particle: {
            type: 'circle', // circle or polygon
            size: 10, // radius if circle, array of points if polygon
            style: {
                fill: {r: 255, g: 255, b: 255, a: 1},
                stroke: {colour: {r: 255, g: 255, b: 255, a: 1}, width: 2},
            },
            decay: {
                life: Infinity, // how many ticks the particle persists for
                fillStyle: {r: 0, g: 0, b: 0, a: 0}, // add to fill style
                strokeStyle: {r: 0, g: 0, b: 0, a: 0}, // add to stroke style
                size: 1 // multiply size by this
            }
        },
        parts: {
            mechFoot: {
                id: 'defaultFoot',
                type: 'polygon', 
                facing: 'body',
                rOffset: 0,
                size: [
                    {x: -10, y: 60},
                    {x: 10, y: 60},
                    {x: 15, y: 50},
                    {x: 15, y: -50},
                    {x: 10, y: -60},
                    {x: -10, y: -60},
                    {x: -15, y: -50},
                    {x: -15, y: 50},
                ],
                offset: {x: 0, y: -5},
                style: {
                    fill: 'rgba(130, 130, 130, 1)',
                    stroke: {colour: '#696969', width: 5},
                },
                collision: false,
                hp: Infinity,
                connected: [],
            },
            MechLowerBody: {
                id: 'lowerBody',
                facing: 'body',
                type: 'circle', 
                rOffset: 0,
                size: 35,
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(140, 140, 140, 1)',
                    stroke: {colour: '#696969', width: 5},
                },
                collision: false,
                hp: Infinity,
                connected: [],
            },
            defaultMechMainBody: {
                id: 'mainBody',
                facing: 'turret',
                type: 'polygon', 
                rOffset: 0,
                size: [
                    {x: -60, y: 40},
                    {x: 60, y: 40},
                    {x: 70, y: 30},
                    {x: 70, y: -30},
                    {x: 60, y: -40},
                    {x: -60, y: -40},
                    {x: -70, y: -30},
                    {x: -70, y: 30},
                ],
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(210, 210, 210, 1)',
                    stroke: {colour: '#696969', width: 10},
                },
                collision: true,
                hp: 5000,
                connected: [],
            },
            defaultMechArm: {
                id: 'defaultArm',
                facing: 'turret',
                type: 'polygon', 
                rOffset: 0,
                size: [
                    {x: -20, y: 50},
                    {x: 20, y: 50},
                    {x: 25, y: 40},
                    {x: 25, y: -60},
                    {x: 20, y: -70},
                    {x: -20, y: -70},
                    {x: -25, y: -60},
                    {x: -25, y: 40},
                ],
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(200, 200, 200, 1)',
                    stroke: {colour: '#696969', width: 10},
                },
                collision: true,
                hp: 3000,
                connected: [],
            },
            mechMachineGun: {
                id: 'defaultMachineGun',
                facing: 'turret',
                type: 'polygon', 
                rOffset: 0,
                size: [
                    {x: -10, y: 0},
                    {x: 10, y: 0},
                    {x: 10, y: 30},
                    {x: -10, y: 30},
                ],
                offset: {x: 0, y: -100},
                style: {
                    fill: 'rgba(150, 150, 150, 1)',
                    stroke: {colour: '#696969', width: 5},
                },
                cannon: {
                    keybind: 'click',
                    x: 0,
                    y: 0,
                    reload: {c: 0, t: 6},
                    spread: Math.PI/48,
                    bullet: {
                        type: 'circle', 
                        size: 8,
                        style: {
                            fill: {r: 100, g: 100, b: 100, a: 1},
                            stroke: {colour: {r: 69, g: 69, b: 69, a: 1}, width: 3},
                        },
                        decay: {
                            life: 120, 
                            fillStyle: {r: 0, g: 0, b: 0, a: 0}, 
                            strokeStyle: {r: 0, g: 0, b: 0, a: 0}, 
                            size: 1
                        },
                        dmg: 100,
                        v: 20,
                        vDrag: 0.99,
                        friendly: true,
                    },
                },
                collision: false,
                hp: Infinity,
                connected: [],
            },
            defaultHead: {
                id: 'defaultHead',
                facing: 'turret',
                type: 'circle', 
                rOffset: 0,
                size: 25,
                offset: {x: 0, y: 0},
                style: {
                    fill: 'rgba(69, 69, 69, 1)',
                    stroke: {colour: '#696969', width: 5},
                },
                collision: false,
                hp: Infinity,
                connected: [],
            },
        },
    }
};

var projectiles = [];
var particles = [];
var entities = [];
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
    player = JSON.parse(JSON.stringify(data.mech));
    player.x += 500;
    entities.push(JSON.parse(JSON.stringify(player)));
    player.x += 500;
    entities.push(JSON.parse(JSON.stringify(player)));
    player.x += 500;
    entities.push(JSON.parse(JSON.stringify(player)));
    player.x += 500;
    entities.push(JSON.parse(JSON.stringify(player)));
    player.x = 0;
    player.directControl = true;
    entities.push(player);
};

// Steal Data (get inputs)
var mousepos = {x:0,y:0};
var display = {x:window.innerWidth, y:window.innerHeight};
console.log(entities);
window.onkeyup = function(e) {
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].directControl) {
            entities[i].keyboard[e.key.toLowerCase()] = false; 
        }
    }
};
window.onkeydown = function(e) {
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].directControl) {
            entities[i].keyboard[e.key.toLowerCase()] = true; 
        }
    }
};
document.addEventListener('mousedown', function(event) {
    if (event.button === 0) { // Check if left mouse button was clicked
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].directControl) {
                entities[i].keyboard.click = true;
            }
        }
    }
});
document.addEventListener('mouseup', function(event) {
    if (event.button === 0) { // Check if left mouse button was released
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].directControl) {
                entities[i].keyboard.click = false;
            }
        }
    }
});
window.addEventListener("resize", function () {
    if (t > 0) {
        display = {x:window.innerWidth,y:window.innerHeight};
        replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas><canvas id="canvasOverlay" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 2;"></canvas>`);
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
    replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas><canvas id="canvasOverlay" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 2;"></canvas>`);
    game();
};

function handlePlayerMotion(unit) {
    if (unit.directControl) {
        unit.aimPos = mousepos;
    }
    unit.mouseR = rotateAngle(unit.mouseR, aim(vMath(vMath(vMath(display,0.5,'multiply'),player,'subtract'),unit,'add'), vMath(vMath(unit.aimPos,player,'subtract'),unit,'add')), unit.tr);
    unit.lastMoved += 1;
    unit.vx = 0;
    unit.vy = 0;
    let speed = unit.v;
    unit.r = correctAngle(unit.r);
    if (unit.keyboard.capslock) {
        speed *= 4;
    }
    if (unit.keyboard.shift) {
        speed *= 2.5;
    }
    let isMoving = false;
    let vector = {x: 0, y: 0}; // special maths
    if (unit.keyboard.w || unit.keyboard.arrowup) { 
        vector.y -= 1
        isMoving = true;
    }
    if (unit.keyboard.s || unit.keyboard.arrowdown) {
        vector.y += 1
        isMoving = true;
    }
    if (unit.keyboard.a || unit.keyboard.arrowleft) { 
        vector.x -= 1
        isMoving = true;
    }
    if (unit.keyboard.d || unit.keyboard.arrowright) { 
        vector.x += 1
        isMoving = true;
    }
    if (isMoving) {
        if (unit.lastMoved >= 20) {
            unit.r = aim({x:0, y: 0}, vector);
        } else {
            unit.r = rotateAngle(unit.r, aim({x:0, y: 0}, vector), unit.vr);
        }
        let velocity = toComponent(speed, unit.r);
        unit.x += velocity.x;
        unit.y += velocity.y;
        unit.vx = velocity.x;
        unit.vy = velocity.y;
        unit.lastMoved = -1;
    }
    //console.log(unit.keyboard);
    /*
    for (var i = 0; i < unit.weapons.length; i+=1) {
        if (unit.weapons[i].keybind == CLICK) {
            if (unit.hasClicked) {
                unit = attemptShoot(i, unit);
            }
        } else {
            if (unit.keyboard[unit.weapons[i].keybind]) {
                unit = attemptShoot(i, unit);
            }
        }
    }*/
    return unit;
};

function polygonCollision(polygon1, polygon2) {
    let collided = false;
    for (let i = 0; i < polygon1.length; i++) {
        if (pointInPolygon(polygon1[i], polygon2)) {
            collided = true;
            break;
        }
    }
    return collided;
};

function simulatePhysics(objects) {
    let newObjs = [];
    for (let i = 0; i < objects.length; i++) {
        let newObj = JSON.parse(JSON.stringify(objects[i]));
        newObj.vx += newObj.ax;
        newObj.vy += newObj.ay;
        newObj.vr += newObj.ar;
        newObj.vx *= newObj.vDrag;
        newObj.vy *= newObj.vDrag;
        newObj.vr += newObj.rDrag;
        let velocity = Math.sqrt(Math.abs(newObj.vx**2) + Math.abs(newObj.vy**2));
        if (velocity > newObj.maxV) {
            let reduction = newObj.maxV / velocity;
            newObj.vx *= reduction;
            newObj.vy *= reduction;
        }
        newObj.vr = Math.min(newObj.vr, newObj.maxRV);
        newObj.x += newObj.vx;
        newObj.y += newObj.vy;
        newObj.r += newObj.vr;
        newObjs.push(newObj);
    }
    return newObjs;
};

function renderParticles(particles) {
    for (let i = 0; i < particles.length; i++) {
        let obj = particles[i];
        if (obj.type == 'circle') {
            drawCircle(obj.x-player.x+display.x/2, obj.y-player.y+display.y/2, obj.size, toColour(obj.style.fill), toColour(obj.style.stroke.colour), obj.style.stroke.width, opacity=1);
        } else if (obj.type == 'polygon') {
            drawPolygon(obj.size, {x: obj.x, y: obj.y}, obj.r, toColour(obj.style.fill), {colour: toColour(obj.style.stroke.colour), width: obj.style.stroke.width}, false);
        } else {
            throw 'ERROR: unsupported particle type';
        }
    }
};

function recursiveParts(unit, parts, f) {
    for (let i = 0; i < parts.length; i++) {
        parts[i] = f(unit, parts[i]);
        parts[i].connected = recursiveParts(unit, parts[i].connected, f);
    }
    return parts;
};

function renderPart(unit, part) {
    if (part.type == 'polygon') {
        let np = offsetPoints(JSON.parse(JSON.stringify(part.size)), part.offset);
        let facing = unit.r;
        if (part.facing == 'turret') {
            facing = unit.mouseR;
        }
        facing += part.rOffset;
        drawPolygon(np, {x: unit.x, y: unit.y}, facing, part.style.fill, part.style.stroke, false);
    } else {
        drawCircle(display.x/2 - player.x + unit.x + part.offset.x, display.y/2 - player.y + unit.y + part.offset.y, part.size, part.style.fill, part.style.stroke.colour, part.style.stroke.width, 1);
    }
    return part;
};

function renderUnit(unit) {
    unit.parts = recursiveParts(unit, unit.parts, renderPart);
    drawCircle(display.x/2 - player.x + unit.x, display.y/2 - player.y + unit.y, unit.collisionR, 'rgba(255, 255, 255, 0.1)', 'rgba(255, 0, 0, 0.9)', 5, 1);
};

function shoot(unit, part) {
    if (part.cannon) {
        if (part.cannon.reload.c > 0) {
            part.cannon.reload.c -= 1;
        } else {
            if (unit.keyboard[part.cannon.keybind]) {
                part.cannon.reload.c = part.cannon.reload.t;
                let facing = unit.r;
                if (part.facing == 'turret') {
                    facing = unit.mouseR;
                }
                let bullet = Object.assign({}, JSON.parse(JSON.stringify(data.template.physics)), JSON.parse(JSON.stringify(part.cannon.bullet)));
                bullet.x = unit.x + ((part.offset.x + part.cannon.x) * Math.cos(facing) - (part.offset.y + part.cannon.y) * Math.sin(facing));
                bullet.y = unit.y + ((part.offset.x + part.cannon.x) * Math.sin(facing) + (part.offset.y + part.cannon.y) * Math.cos(facing));
                facing += normalDistribution(0, part.cannon.spread);
                let res = toComponent(bullet.v, facing);
                bullet.vx = res.x + unit.vx;
                bullet.vy = res.y + unit.vy;
                projectiles.push(bullet);
            }
        }
    }
    return part;
};

function handleShooting(unit) {
    unit.parts = recursiveParts(unit, unit.parts, shoot);
    return unit;
};

function handleDecay(objs) {
    let newObjs = []
    for (let i = 0; i < objs.length; i++) {
        let obj = objs[i];
        //console.log(obj);
        obj.decay.life -= 1;
        if(obj.decay.life > 0) {
            if (obj.type == 'polygon') {
                for (let j = 0; j < obj.size.length; j++) {
                    obj.size[j].x *= obj.decay.size;
                    obj.size[j].y *= obj.decay.size;
                }
            } else {
                obj.size *= obj.decay.size;
            }
            obj.style.fill.r += obj.decay.fillStyle.r;
            obj.style.fill.g += obj.decay.fillStyle.g;
            obj.style.fill.b += obj.decay.fillStyle.b;
            obj.style.fill.a += obj.decay.fillStyle.a;
            obj.style.stroke.r += obj.decay.strokeStyle.r;
            obj.style.stroke.g += obj.decay.strokeStyle.g;
            obj.style.stroke.b += obj.decay.strokeStyle.b;
            obj.style.stroke.a += obj.decay.strokeStyle.a;
            newObjs.push(obj);
        }
    }
    return newObjs;
};

function recursiveColision(unit, pts, proj) {
    let parts = JSON.parse(JSON.stringify(pts));
    let projectile = JSON.parse(JSON.stringify(proj));
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].collision) {
            let collide = false;
            if (parts[i].type == 'polygon') {
                let points = offsetPoints(offsetPoints(JSON.parse(JSON.stringify(parts[i].size)), parts[i].offset), unit);
                //console.log(points);
                if (pointInPolygon(projectile, points)) {
                    collide = true;
                }
            } else {
                //console.log(getDist(offsetPoints(JSON.parse(JSON.stringify([parts[i].offset])), unit)[0], projectile));
                if (getDist(offsetPoints(JSON.parse(JSON.stringify([parts[i].offset])), unit)[0], projectile) <= parts[i].size) {
                    collide = true;
                }
            }
            if (collide) {
                parts[i].hp -= projectile.dmg;
                parts[i].isHit=5;
                projectile.dmg = 0; // have to do this to stop it hitting multiple parts (this is inefficient but hard to fix. maybe rework this to not use recursion? bfs?)
                return [parts, projectile];
            }
        }
        let res = recursiveColision(unit, parts[i].connected, projectile);
        parts[i].connected = res[0];
        projectile = res[1];
    }
    return [parts, projectile];
};

function handleColisions(units, projectiles) {
    let newProj = [];
    if (projectiles.length && units.length) {
        for (let i = 0; i < projectiles.length; i++) {
            for (let j = 0; j < units.length; j++) {
                if (getDist(projectiles[i], units[j]) <= units[j].collisionR) {
                    let res = recursiveColision(units[j], units[j].parts, projectiles[i]);
                    units[j].parts = res[0];
                    projectiles[i] = res[1];
                }
            }
            if (projectiles[i].dmg != 0) {
                newProj.push(projectiles[i]);
            }
        }
        return [units, newProj];
    }
    return [units, projectiles];
};

function main() {
    clearCanvas('main');
    clearCanvas('canvasOverlay');
    grid(200);
    const points = [
        {x: 100, y: 100},
        {x: 200, y: 50},
        {x: 150, y: 100},
        {x: 200, y: 200}
    ];
    drawPolygon(points, {x: 100, y: 100}, 0, 'rgba(0, 0, 255, 0.75)', {colour: '#696969', width: 10}, false);
    drawPolygon(points, {x: 100, y: 100}, Math.PI/2, 'rgba(0, 0, 255, 0.75)', {colour: '#696969', width: 10}, false);
    drawPolygon(points, {x: 100, y: 100}, Math.PI, 'rgba(0, 0, 255, 0.75)', {colour: '#696969', width: 10}, false);
    drawPolygon(points, {x: 100, y: 100}, 3*Math.PI/2, 'rgba(0, 0, 255, 0.75)', {colour: '#696969', width: 10}, false);
    const points2 = [
        {x: 0, y: 0},
        {x: 100, y: 0},
        {x: 100, y: 100},
        {x: 0, y: 100}
    ];
    drawPolygon(points2, {x: 0, y: 0}, Math.PI/4, 'rgba(255, 0, 0, 0.75)', {colour: '#696969', width: 10}, false);
    drawPolygon(points2, {x: 0, y: 0}, false, 'rgba(0, 255, 0, 0.5)', {colour: '#696969', width: 10}, false);
    
    let res = handleColisions(entities, projectiles);
    entities = res[0];
    projectiles = res[1];

    for (let i = 0; i < entities.length; i++) {
        entities[i] = handlePlayerMotion(entities[i]);
        entities[i] = handleShooting(entities[i]);
        renderUnit(entities[i]);
    }
    projectiles = simulatePhysics(projectiles);
    //console.log(projectiles);
    projectiles = handleDecay(projectiles);
    renderParticles(projectiles);
}

var t=0;
async function game() {
    while (1) {
        main();
        await sleep(1000/60);
        t++;
    }
}

/*
style: {
    fill: {r: 255, g: 255, b: 255, a: 1},
    stroke: {colour: {r: 255, g: 255, b: 255, a: 1}, width: 2},
},
decay: {
    life: Infinity, // how many ticks the particle persists for
    fillStyle: {r: 0, g: 0, b: 0, a: 0}, // add to fill style
    strokeStyle: {r: 0, g: 0, b: 0, a: 0}, // add to stroke style
    size: 1 // multiply size by this
}


*/
