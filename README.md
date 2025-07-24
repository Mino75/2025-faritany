
# 🗺️ Faritany

## 📋 Table of Contents
- [📖 About](#-about)
- [🚀 Getting Started](#-getting-started)
- [🔨 How to Build / How to Run](#-how-to-build--how-to-run)
- [🏗️ Project Structure](#️-project-structure)
- [🎯 Game Rules](#-game-rules)
- [🎮 Features](#-features)
- [🎲 How to Play](#-how-to-play)
- [🐳 Docker Deployment](#-docker-deployment)
- [📄 License](#-license)

## 📖 About
Faritany is a strategic territory conquest game inspired by Go, featuring a 22x38 grid where two players compete to encircle enemy territories. The game combines classic strategy elements with modern web technologies, offering an engaging experience with beautiful interactive gameplay.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Modern web browser with HTML5 Canvas support
- Mouse or touch input device

### 📦 Installation
```bash
git clone <repository-url>
cd faritany
npm install
```

## 🔨 How to Build / How to Run

### Development Mode
```bash
# Start the development server
node server.js
```
The game will be available at `http://localhost:3000`

### Production Mode
```bash
# Install dependencies
npm install

# Start the production server
node server.js
```

## 🏗️ Project Structure
```
faritany/
├── index.html          # Main game interface with sidebar layout
├── main.js             # Game logic, isometric rendering, and player mechanics
├── styles.js           # Game styling and responsive design
├── server.js           # Express server configuration
├── manifest.json       # PWA manifest for installation
├── package.json        # Project dependencies and metadata
├── .gitignore          # Git ignore patterns
└── .github/workflows/  # CI/CD automation
    └── main.yml        # Docker build and deployment
```

## 🎯 Game Rules

### Board Setup
- **Grid Size**: 22 columns × 38 rows
- **Borders**: Left margin (column 0) is closed wall
- **Open Borders**: Top, bottom, and right borders are open
- **Intersection Play**: Players place points on grid intersections

### Gameplay
1. **Two Players**: Blue and Red players alternate turns
2. **Objective**: Encircle enemy territories to score points
3. **Encirclement**: Completely surround enemy groups with your points
4. **Scoring**: Only enemy groups containing at least one point count
5. **Border Drawing**: Encirclement borders connect along opponent's active points
6. **Point Disabling**: Encircled points become disabled but remain visible
7. **Click Precision**: Mouse must be close enough to intersection center

### Victory Conditions
- **Territory Control**: Player with most encircled enemy territory wins
- **Strategic Positioning**: Balance offense and defense
- **Resource Management**: Disabled points cannot form new encirclements

## 🎮 Features
- **Isometric 3D Graphics**: Beautiful visual perspective with depth
- **Interactive Minimap**: Real-time overview of the entire battlefield
- **Responsive Sidebar**: Game rules, score tracking, and minimap
- **Real-time Scoring**: Dynamic territory calculation
- **Visual Feedback**: Clear indication of player moves and territories
- **Touch Support**: Mobile-friendly controls
- **Progressive Web App**: Installable on devices
- **Custom Popup System**: In-game rules and help system

## 🎲 How to Play

### Getting Started
1. **Game Setup**: Two players take turns (Blue starts first)
2. **Place Points**: Click near grid intersections to place your points
3. **Strategy**: Plan your moves to encircle enemy territories
4. **Scoring**: Successfully encircle enemy groups to gain points

### Controls
- **Mouse Click**: Place points on intersections
- **Minimap**: Click to navigate large battlefield
- **Rules Button**: Open game rules popup
- **Score Display**: Monitor current territory control

### Strategy Tips
- **Defensive Play**: Protect your territories from encirclement
- **Offensive Play**: Surround enemy groups efficiently
- **Border Control**: Use open borders strategically
- **Point Conservation**: Avoid unnecessary point placement

### Advanced Tactics
- **Multi-Group Encirclement**: Surround multiple enemy groups simultaneously
- **Defensive Walls**: Create barriers to protect territory
- **Counter-Encirclement**: Break enemy encirclement attempts
- **Endgame Strategy**: Focus on large territory captures

## 🐳 Docker Deployment

### Build and Run
```bash
# Build Docker image
docker build -t faritany:latest .

# Run container
docker run -p 3000:3000 faritany:latest
```

### Environment Configuration
- **Base Image**: Node.js Alpine
- **Port**: 3000
- **Static Files**: Served via Express

## 📄 License
MIT License - see LICENSE file for details.
