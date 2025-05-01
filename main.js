const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) alert('WebGL2 not supported');

const restartBtn = document.getElementById('restartBtn');
function restartGame() {
  score = 0;
  updateScore();
  lives = 3;
  gameRunning = true;

  // Reset hearts
  hearts.forEach(heart => heart.style.display = "inline");

  // Reset blocks
  blocks.forEach(block => block.reset());

  // Hide Game Over & Restart button
  gameOverText.style.display = "none";
  restartBtn.style.display = "none";

  // Start game loop again
  draw();
}

restartBtn.addEventListener('click', restartGame);



const catchSound = document.getElementById("catchSound");
const missSound = document.getElementById("missSound");
const gameOverSound = document.getElementById("gmaeOverSound");

function playCatchSound() {
  catchSound.currentTime = 0;
  catchSound.play();
}

function playMissSound() {
  missSound.currentTime = 0;
  missSound.play();
}

function playGameOverSound() {
  gameOverSound.currentTime = 0;
  gameOverSound.play();
}

let lives = 3;
const hearts = document.querySelectorAll('.heart');
const gameOverText = document.getElementById('gameOver');
let gameRunning = true;


let score = 0;
const scoreEl = document.getElementById("score");
function updateScore() {
  scoreEl.textContent = `Score: ${score}`;
}

// Resize canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
resize();
window.addEventListener('resize', resize);

// Vertex shader source
const vertexSrc = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// Fragment shader source
const fragmentSrc = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
  outColor = vec4(0.2, 0.8, 1.0, 1.0); // Light blue
}`;

// Compile shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Create shader program
function createProgram(gl, vSrc, fSrc) {
  const vShader = createShader(gl, gl.VERTEX_SHADER, vSrc);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const program = createProgram(gl, vertexSrc, fragmentSrc);
gl.useProgram(program);


// Paddle data (2 triangles = 1 rectangle)
const paddleWidth = 0.3;
const paddleHeight = 0.05;
const paddleY = -0.8; // Bottom of the screen
let paddleX = 0;
const paddleSpeed = 0.02;

// Initial buffer data setup
function createPaddleVertices(x) {
  return new Float32Array([
    x - paddleWidth, paddleY,
    x + paddleWidth, paddleY,
    x - paddleWidth, paddleY + paddleHeight,
    x - paddleWidth, paddleY + paddleHeight,
    x + paddleWidth, paddleY,
    x + paddleWidth, paddleY + paddleHeight,
  ]);
}

let vertices = createPaddleVertices(paddleX);
const positionBuffer = gl.createBuffer();
const paddleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

// Falling block setup
class Block {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = (Math.random() * 2 - 1) * 0.9;
    this.y = 1.1;
    this.size = 0.05;
    this.speed = 0.01 + Math.random() * 0.005;
  }

  update() {
    this.y -= this.speed;
    // Collision with paddle
    if (
      this.y - this.size * 2 <= paddleY + paddleHeight &&
      this.y >= paddleY &&
      this.x >= paddleX - paddleWidth &&
      this.x <= paddleX + paddleWidth
    ) {
      score++;
      playCatchSound();
      updateScore();      
      //console.log("🎯 Block caught!");
      this.reset();
    }
    // Missed
    if (this.y < -1.2) {
      score = Math.max(0, score - 1);
      playMissSound();
      updateScore();
      //console.log("❌ Block missed!");
      lives--;
      if (lives >= 0 && hearts[lives]) {
        hearts[lives].style.display = "none";
      }

      if (lives <= 0) {
        gameRunning = false;
        gameOverText.style.display = "block";
        playGameOverSound(); // Play the game over sound
        restartBtn.style.display = "inline";
      }
      this.reset();
    }
  }

  getVertices() {
    return new Float32Array([
      this.x - this.size, this.y,
      this.x + this.size, this.y,
      this.x - this.size, this.y - this.size * 2,
      this.x - this.size, this.y - this.size * 2,
      this.x + this.size, this.y,
      this.x + this.size, this.y - this.size * 2,
    ]);
  }
}

const numBlocks =2;
const blocks = Array.from({ length: numBlocks }, () => new Block());


const blockBuffer = gl.createBuffer();



// Link attribute
const positionLoc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Game loop
function draw() {
  if (!gameRunning) return;
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Move paddle (left/right arrows)
  if (keys["ArrowLeft"] && paddleX - paddleSpeed > -1) {
    paddleX -= paddleSpeed;
  }
  if (keys["ArrowRight"] && paddleX + paddleSpeed < 1) {
    paddleX += paddleSpeed;
  }

  // Draw paddle
  gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
  const paddleVertices = new Float32Array([
    paddleX - paddleWidth, paddleY,
    paddleX + paddleWidth, paddleY,
    paddleX - paddleWidth, paddleY + paddleHeight,
    paddleX - paddleWidth, paddleY + paddleHeight,
    paddleX + paddleWidth, paddleY,
    paddleX + paddleWidth, paddleY + paddleHeight,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, paddleVertices, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Draw and update all blocks
  gl.bindBuffer(gl.ARRAY_BUFFER, blockBuffer);
  for (const block of blocks) {
    block.update();
    const verts = block.getVertices();
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  requestAnimationFrame(draw);
}

draw();


