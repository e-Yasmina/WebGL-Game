# 🎮 WebGL2 Falling Blocks Game

A basic WebGL2-powered mini-game where the player moves a paddle to catch falling blocks. The game tracks the score, lives, and ends after three missed blocks. Audio feedback and a restart button are included for an enhanced game feel.

## 🎮 Preview

<div style="text-align: center;">
  <video src="preview.mp4" autoplay loop muted playsinline width="500"></video>
</div>

---

## 🚀 Features

- 🧱 Multiple blocks fall randomly
- 🎮 Player-controlled paddle (← → arrow keys)
- 📊 Score tracking
- ❤️ 3 Lives displayed as hearts
- 🔊 Sound effects for catch and miss
- 🛑 Game Over screen
- 🔁 Restart button

---

## 📁 Project Structure

```
/WebGL
├── index.html       # Game HTML interface
├── main.js          # Core JavaScript logic using WebGL2
├── catch.wav        # Sound when a block is caught
├── miss.wav         # Sound when a block is missed
├── game_over.wav    # Sound when the game is over
├── game_over.gif    # Game Over GIF displayed on losing
├── README.md        # Project documentation
```
---

## 🧑‍💻 How to Run

To run this game locally:

1. **Use a local server** (due to WebGL and CORS restrictions).
   You can use VS Code's Live Server extension, Python, or any other method:

   - Python (from terminal in project folder):
     ```bash
     python -m http.server
     ```

   - Open your browser and go to:
     ```
     http://localhost:8000
     ```

2. **Controls:**
   - `←` Move paddle left
   - `→` Move paddle right

---

## 🛠 Technologies

- WebGL2
- JavaScript
- HTML5

---


## 🙌 Credits

- Sound effects from [mixkit.co](https://mixkit.co)
- Developed with 💻 by Yasmina Elbernoussi

---

Enjoy the game!
