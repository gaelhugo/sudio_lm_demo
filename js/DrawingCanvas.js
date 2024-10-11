export default class DrawingCanvas {
  constructor(container, onAnalyze) {
    this.container = container;
    this.onAnalyze = onAnalyze;
    this.isDrawing = false;
    this.createCanvas();
    this.drawDefaultCat();
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 500;
    this.canvas.height = 500;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "black";

    // Fill the canvas with white background
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.addEventListener("mousemove", this.draw.bind(this));
    this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "canvas-wrapper";
    canvasWrapper.appendChild(this.canvas);

    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear";
    clearButton.addEventListener("click", this.clearCanvas.bind(this));

    const analyzeButton = document.createElement("button");
    analyzeButton.textContent = "Analyze";
    analyzeButton.addEventListener("click", this.onAnalyze);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "fileInput";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", this.loadImage.bind(this));

    const fileInputLabel = document.createElement("label");
    fileInputLabel.htmlFor = "fileInput";
    fileInputLabel.textContent = "Upload Image";
    fileInputLabel.className = "file-input-label";

    const controls = document.createElement("div");
    controls.className = "canvas-controls";
    controls.appendChild(fileInput);
    controls.appendChild(fileInputLabel);
    controls.appendChild(clearButton);
    controls.appendChild(analyzeButton);

    this.container.appendChild(canvasWrapper);
    this.container.appendChild(controls);
  }

  loadImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.clearCanvas();
          // Calculate scaling to fit the image within the canvas
          const scale = Math.min(
            this.canvas.width / img.width,
            this.canvas.height / img.height
          );
          const x = this.canvas.width / 2 - (img.width / 2) * scale;
          const y = this.canvas.height / 2 - (img.height / 2) * scale;
          this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  drawDefaultCat() {
    this.ctx.beginPath();

    // Draw cat's head
    this.ctx.arc(250, 250, 100, 0, Math.PI * 2);

    // Draw cat's ears
    this.ctx.moveTo(175, 200);
    this.ctx.lineTo(200, 150);
    this.ctx.lineTo(225, 200);
    this.ctx.moveTo(325, 200);
    this.ctx.lineTo(300, 150);
    this.ctx.lineTo(275, 200);

    // Draw cat's eyes
    this.ctx.moveTo(220, 230);
    this.ctx.arc(220, 230, 15, 0, Math.PI * 2);
    this.ctx.moveTo(280, 230);
    this.ctx.arc(280, 230, 15, 0, Math.PI * 2);

    // Draw cat's nose
    this.ctx.moveTo(250, 270);
    this.ctx.lineTo(240, 280);
    this.ctx.lineTo(260, 280);
    this.ctx.closePath();

    // Draw cat's mouth
    this.ctx.moveTo(240, 290);
    this.ctx.quadraticCurveTo(250, 300, 260, 290);

    // Draw cat's whiskers
    this.ctx.moveTo(190, 270);
    this.ctx.lineTo(230, 260);
    this.ctx.moveTo(190, 280);
    this.ctx.lineTo(230, 280);
    this.ctx.moveTo(190, 290);
    this.ctx.lineTo(230, 300);
    this.ctx.moveTo(310, 270);
    this.ctx.lineTo(270, 260);
    this.ctx.moveTo(310, 280);
    this.ctx.lineTo(270, 280);
    this.ctx.moveTo(310, 290);
    this.ctx.lineTo(270, 300);

    this.ctx.stroke();
  }

  startDrawing(e) {
    this.isDrawing = true;
    this.draw(e);
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  clearCanvas() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getImageData() {
    return this.canvas.toDataURL("image/png").split(",")[1];
  }
}
