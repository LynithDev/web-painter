/**
 * ##########################################################
 * ####   What you're about to see is some crappy code   ####
 * ##########################################################
*/

let mouseX: number = 0;
let mouseY: number = 0;

window.addEventListener("mousemove", (e) => {
    const canvas = <HTMLCanvasElement> document.getElementById("paint-canvas");
    mouseX = e.clientX - canvas.getBoundingClientRect().left;
    mouseY = e.clientY - canvas.getBoundingClientRect().top;
})

const utils = {
    contrast: (color: string, amount: number) => '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2))
}

let canvasPaint;

const render = () => {
    const canvas = <HTMLCanvasElement> document.getElementById("paint-canvas");
    if (canvas == null) return;

    const options: { columns: number, rows: number, cellsize: number } = {
        columns: Number((document.getElementById("columns") as HTMLInputElement).value),
        rows: Number((document.getElementById("rows") as HTMLInputElement).value),
        cellsize: Number((document.getElementById("cellsize") as HTMLInputElement).value)
    }

    canvas.width = options.rows * options.cellsize;
    canvas.height = options.columns * options.cellsize;

    canvasPaint = new CanvasPaint(canvas, options.columns, options.rows, options.cellsize);
    canvasPaint.draw();
}

document.getElementById("new")?.addEventListener("click", () => {
    canvasPaint = undefined;
    render();
});

document.getElementById("save")?.addEventListener("click", () => {
    const image = new Image();
    image.src = (document.getElementById("paint-canvas") as HTMLCanvasElement).toDataURL("image/png");
    image.style.border = "1px solid black";
    image.style.borderRadius = "3px";
    document.body.appendChild(image);
})

class CanvasPaint {
    private ctx: CanvasRenderingContext2D;
    private elements: CanvasElement[] = [];
    constructor(private canvas: HTMLCanvasElement, private columns: number, private rows: number, private cellSize: number) {
        let ctx = this.canvas.getContext("2d");
        if (ctx == null) return;
        this.ctx = ctx;
    }

    draw() {
        this.elements = [];
        for (let y = 0; y < this.columns; y++) {
            for (let x = 0; x < this.rows; x++) {
                this.elements.push(new CanvasElement(this.canvas, this.ctx, x * this.cellSize, y * this.cellSize, this.cellSize, "#ffffff"));
            }
        }

        const click = () => {
            const el = this.getElementFromXY(mouseX, mouseY);
            if (!el) return;
            el.setFill((document.getElementById("colorpicker") as HTMLInputElement).value);
            const i = this.elements.indexOf(el);
            if (i > -1) {
                this.elements.splice(i, 1);
                this.elements.push(el);
            }
        };

        let holdInterval;
        window.addEventListener("mouseup", () => { clearInterval(holdInterval); }, false);

        this.canvas.addEventListener("mousedown", () => {
            holdInterval = setInterval(() => { click(); }, 5);
        }, false);

        const draw = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.drawBoard();
            this.elements.forEach((el) => el.draw())
        }

        draw();

        const tick = () => {
            if (mouseX >= -20 && mouseX <= this.canvas.width + 20 && mouseY >= -20 && mouseY <= this.canvas.height + 20) 
                draw();
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    private drawBoard() {
        this.canvas.style.border = "1px solid #555";
        this.canvas.style.borderRadius = "3px";
    }

    private debugMouse() {
        this.ctx.fillStyle = "#000000";
        this.ctx.font = '12px Inter';
        const metrics = this.ctx.measureText(`${mouseX} ${mouseY}`);
        this.ctx.fillText(`${mouseX} ${mouseY}`, mouseX - metrics.width / 2, mouseY + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 3);
    }

    private getElementFromXY(x: number, y: number): CanvasElement | undefined {
        return this.elements.filter((el) => x >= el.x && x < el.x + el.cellSize && y >= el.y && y < el.y + el.cellSize)[0];
    }

}

class CanvasElement {
    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, public x: number, public y: number, public cellSize: number, private fill: string) {}

    draw() {
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

    }

    setFill(fill: string) {
        this.fill = fill;
    }
}
