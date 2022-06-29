/**
 * ##########################################################
 * ####   What you're about to see is some crappy code   ####
 * ##########################################################
*/
var _a, _b;
var mouseX = 0;
var mouseY = 0;
window.addEventListener("mousemove", function (e) {
    var canvas = document.getElementById("paint-canvas");
    mouseX = e.clientX - canvas.getBoundingClientRect().left;
    mouseY = e.clientY - canvas.getBoundingClientRect().top;
});
var utils = {
    contrast: function (color, amount) { return '#' + color.replace(/^#/, '').replace(/../g, function (color) { return ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2); }); }
};
var canvasPaint;
var render = function () {
    var canvas = document.getElementById("paint-canvas");
    if (canvas == null)
        return;
    var options = {
        columns: Number(document.getElementById("columns").value),
        rows: Number(document.getElementById("rows").value),
        cellsize: Number(document.getElementById("cellsize").value)
    };
    canvas.width = options.rows * options.cellsize;
    canvas.height = options.columns * options.cellsize;
    canvasPaint = new CanvasPaint(canvas, options.columns, options.rows, options.cellsize);
    canvasPaint.draw();
};
(_a = document.getElementById("new")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    canvasPaint = undefined;
    render();
});
(_b = document.getElementById("save")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    var image = new Image();
    image.src = document.getElementById("paint-canvas").toDataURL("image/png");
    image.style.border = "1px solid black";
    image.style.borderRadius = "3px";
    document.body.appendChild(image);
});
var CanvasPaint = /** @class */ (function () {
    function CanvasPaint(canvas, columns, rows, cellSize) {
        this.canvas = canvas;
        this.columns = columns;
        this.rows = rows;
        this.cellSize = cellSize;
        this.elements = [];
        var ctx = this.canvas.getContext("2d");
        if (ctx == null)
            return;
        this.ctx = ctx;
    }
    CanvasPaint.prototype.draw = function () {
        var _this = this;
        this.elements = [];
        for (var y = 0; y < this.columns; y++) {
            for (var x = 0; x < this.rows; x++) {
                this.elements.push(new CanvasElement(this.canvas, this.ctx, x * this.cellSize, y * this.cellSize, this.cellSize, "#ffffff"));
            }
        }
        var click = function () {
            var el = _this.getElementFromXY(mouseX, mouseY);
            if (!el)
                return;
            el.setFill(document.getElementById("colorpicker").value);
            var i = _this.elements.indexOf(el);
            if (i > -1) {
                _this.elements.splice(i, 1);
                _this.elements.push(el);
            }
        };
        var holdInterval;
        window.addEventListener("mouseup", function () { clearInterval(holdInterval); }, false);
        this.canvas.addEventListener("mousedown", function () {
            holdInterval = setInterval(function () { click(); }, 5);
        }, false);
        var draw = function () {
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this.drawBoard();
            _this.elements.forEach(function (el) { return el.draw(); });
        };
        draw();
        var tick = function () {
            if (mouseX >= -20 && mouseX <= _this.canvas.width + 20 && mouseY >= -20 && mouseY <= _this.canvas.height + 20) {
                draw();
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    CanvasPaint.prototype.drawBoard = function () {
        this.canvas.style.border = "1px solid #555";
        this.canvas.style.borderRadius = "3px";
    };
    CanvasPaint.prototype.debugMouse = function () {
        this.ctx.fillStyle = "#000000";
        this.ctx.font = '12px Inter';
        var metrics = this.ctx.measureText("".concat(mouseX, " ").concat(mouseY));
        this.ctx.fillText("".concat(mouseX, " ").concat(mouseY), mouseX - metrics.width / 2, mouseY + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 3);
    };
    CanvasPaint.prototype.getElementFromXY = function (x, y) {
        return this.elements.filter(function (el) { return x >= el.x && x < el.x + el.cellSize && y >= el.y && y < el.y + el.cellSize; })[0];
    };
    return CanvasPaint;
}());
var CanvasElement = /** @class */ (function () {
    function CanvasElement(canvas, ctx, x, y, cellSize, fill) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.fill = fill;
    }
    CanvasElement.prototype.draw = function () {
        this.ctx.fillStyle = this.fill;
        this.ctx.fillRect(this.x, this.y, this.cellSize, this.cellSize);
        if (mouseX >= this.x && mouseX < this.x + this.cellSize && mouseY >= this.y && mouseY < this.y + this.cellSize) {
            this.ctx.fillStyle = utils.contrast(this.ctx.fillStyle.toString(), -20);
            this.ctx.fillRect(this.x, this.y, this.cellSize, this.cellSize);
        }
        if (mouseX >= 0 && mouseX <= this.canvas.width && mouseY >= 0 && mouseY <= this.canvas.height) {
            this.ctx.strokeStyle = '#cccccc';
            this.ctx.strokeRect(this.x, this.y, this.cellSize, this.cellSize);
        }
    };
    CanvasElement.prototype.setFill = function (fill) {
        this.fill = fill;
    };
    return CanvasElement;
}());
