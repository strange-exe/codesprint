# ⚡ CodeSprint: Real-Time Competitive Typing Game  

**CodeSprint** is a competitive, browser-based coding challenge where speed meets accuracy.  
Players type real code snippets (Python, JavaScript, C — more coming soon!) under time pressure, while every keystroke is tracked.  

Scores are calculated based on:  
- ⌨️ **WPM (Words Per Minute)**  
- ✅ **Accuracy**  
- 🔥 **Difficulty multipliers**  
- ⚠️ **Penalties for mistakes and backspaces**  

All results are stored in **Firebase Firestore**, powering a **live global leaderboard** that updates instantly as players complete their runs.  

---

## 🚀 Features  

- 🎯 Multi-language snippets: Python, JavaScript, C (easy, medium, hard).  
- ⚡ Real-time leaderboard: Firebase-backed, instantly updating.  
- 🖊 Code-aware input: Tabs, indentation, and spacing like real editors.  
- 🎨 Clean UI: Responsive, distraction-free, editor-inspired design.  
- 🔄 Replayable sessions: Play multiple rounds, track improvements.  
- 🔑 Secure scoring: Validated client-side + stored safely in Firestore.  

---

## 🛠 Tech Stack  

- **Frontend:** HTML, CSS, JavaScript (Vanilla)  
- **Backend / DB:** Firebase Firestore (real-time sync)  
- **Hosting:** GitHub Pages  
- **Game Engine:** Custom JS for typing logic, scoring, snippet cycling  

---

## 📊 Scoring System  

- **Base Score:** Derived from characters typed, time, accuracy, difficulty.  
- **Penalty:** Extra time added for mistakes/backspaces.  
- **Final Score:** Normalized across difficulties for fairness.  

---

## 🎮 How to Play  

1. Open the game in your browser.  
2. Pick your **language** (Python / JS / C) and **difficulty**.  
3. Type the snippet as quickly & accurately as possible.  
4. Your score auto-saves and appears on the **global leaderboard**.  
5. Compete with others and climb the rankings!  


---

## 🌟 Why CodeSprint?  

Unlike regular typing games, **CodeSprint** uses *real code*.  
Players practice actual syntax and programming logic under competitive conditions.  
It’s both a **fun game** and a **practical coding skill booster** — perfect for hackathons, bootcamps, or practice sessions.  

---

## 🔗 Live Demo  

👉 [Play CodeSprint](https://abhinesh.me/codesprint/)  

---


