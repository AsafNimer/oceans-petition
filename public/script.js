let isDrawing = false;
let x = 0;
let y = 0;

const signCanvas = document.getElementById("canvas");
const context = signCanvas.getContext("2d");
const submitButton = document.getElementById("button-submit");

signCanvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

signCanvas.addEventListener("mousemove", (e) => {
    if (isDrawing === true) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

signCanvas.addEventListener("mouseup", (e) => {
    if (isDrawing === true) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1.5;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

submitButton.addEventListener("click", () => {
    document.getElementById("signature").value = signCanvas.toDataURL();
});
