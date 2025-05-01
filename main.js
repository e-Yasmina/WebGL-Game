const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) alert('WebGL2 not supported');

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
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

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
  // Update paddle position
  if (keys["ArrowLeft"]) paddleX -= paddleSpeed;
  if (keys["ArrowRight"]) paddleX += paddleSpeed;

  // Clamp to screen edges
  const maxX = 1 - paddleWidth;
  paddleX = Math.max(-maxX, Math.min(maxX, paddleX));

  // Update paddle data
  vertices = createPaddleVertices(paddleX);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  // Clear & draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(draw);
}

draw();

