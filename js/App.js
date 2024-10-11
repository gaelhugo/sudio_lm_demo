import DrawingCanvas from "./DrawingCanvas.js";

export default class App {
  constructor() {
    this.initializeDOM();
    this.drawingCanvas = new DrawingCanvas(
      document.querySelector(".drawing-canvas"),
      this.analyzeDrawing.bind(this)
    );
    this.addInputEventListener();
  }

  initializeDOM() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="container">
        <div class="content">
          <div class="drawing-section">
            <div class="drawing-canvas"></div>
            <input type="text" class="question-input" placeholder="Ask about the image...">
          </div>
          <div class="analysis-section">
            <div class="analyzing" style="display: none;">Analyzing image...</div>
            <div class="analysis-result" style="display: none;">
              <h3>Analysis Result:</h3>
              <p></p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.input = app.querySelector(".question-input");
    this.analyzingDiv = app.querySelector(".analyzing");
    this.analysisResultDiv = app.querySelector(".analysis-result");
    this.analysisResultContent = this.analysisResultDiv.querySelector("p");
  }

  addInputEventListener() {
    this.input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to stop form submission
        this.analyzeDrawing();
      }
    });
  }

  async analyzeDrawing() {
    this.analyzingDiv.style.display = "block";
    this.analysisResultContent.textContent = "";
    this.analysisResultDiv.style.display = "block";
    const imageData = this.drawingCanvas.getImageData();
    const userQuestion = this.input.value.trim() || "What's in this image?";

    try {
      const response = await fetch(
        "http://localhost:1234/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer lm-studio",
          },
          body: JSON.stringify({
            model: "FiditeNemini/Llama-3.1-Unhinged-Vision-8B-GGUF",
            messages: [
              {
                role: "system",
                content: "You are a creative poet.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: userQuestion },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/png;base64,${imageData}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 8000,
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim() === "data: [DONE]") {
            // Stream has ended
            return;
          }
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                this.analysisResultContent.textContent += content;
              }
            } catch (error) {
              console.log("Error parsing JSON:", error);
              // Continue to the next line if there's an error parsing this one
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (!this.analysisResultContent.textContent) {
        this.analysisResultContent.textContent =
          "An error occurred while analyzing the image.";
      }
    } finally {
      this.analyzingDiv.style.display = "none";
      this.input.value = ""; // Clear the input field after analysis
    }
  }
}
