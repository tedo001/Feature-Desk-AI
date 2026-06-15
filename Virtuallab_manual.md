# Science Hub Project Manual & Technical Guide

This document provides a comprehensive overview of the **Science Hub** project, a 3D interactive virtual laboratory environment that integrates PhET simulations. It details the project architecture, technical implementations, workflows, and deployment strategies.

## 1. Project Overview

**Science Hub** is a web-based platform serving as a central access point for various educational science simulations (Physics, Chemistry, Biology). It features:

- **Immersive 3D Navigation**: A Three.js-based 3D carousel for browsing experiments.
- **Premium UI/UX**: High-fidelity graphics, glassmorphism effects, and dynamic loading animations.
- **Seamless Integration**: Wraps standard PhET HTML5 simulations within a consistent application shell.
- **Scalable Architecture**: Designed to host hundreds of simulations across multiple distributed deployments.

## 2. Directory Structure

The project is organized as a monorepo containing the Hub application and numerous PhET simulation repositories.

```text

/

├── index.html                  # Main Landing Page / Hub Entry

├── physics-lab.html            # Physics Lab 3D Environment

├── chemistry-lab.html          # Chemistry Lab 3D Environment (similar structure)

├── biology-lab.html            # Biology Lab 3D Environment (similar structure)

├── experiment-wrapper.html     # Universal wrapper for running simulations

├── style.css                   # Global styles

├── deploy-unique.ps1           # Main automated deployment script (Powershell)

├── netlify-deploys/            # Deployment artifacts directory

├── [sim-repo-name]/            # Cloned PhET simulation repositories (e.g., ph-scale, forces-and-motion)

└── ...

```

## 3. Core Components

### 3.1 3D Lab Environments (`*-lab.html`)

Each lab (Physics, Chemistry, Biology) is a standalone HTML page powered by **Three.js**.

- **Visuals**: Features a starfield background, dynamic lighting, and a 3D carousel of "cards".
- **Interaction**: Users swipe (touch) or drag (mouse) to rotate the carousel. Clicking "Launch" opens the simulation.
- **Tech**: Uses `THREE.BoxGeometry` for cards, `THREE.CanvasTexture` for dynamic card content, and `UnrealBloomPass` for visual glow effects.

### 3.2 Experiment Wrapper (`experiment-wrapper.html`)

A unified container that runs actual simulations in an `<iframe>`.

- **Purpose**: Provides a consistent "Back to Lab" button and loading experience across all simulations without modifying the simulation code itself.
- **Mechanism**: Accepts URL parameters (`exp`, `title`, `icon`, `return`) to dynamically load the correct content.
- **Loading Animation**: A complex SVG-based "hexagonal portal" animation plays while the iframe loads.

### 3.3 Simulations

The simulations are standard HTML5/JS apps from PhET. They are deployed to separate sub-domains (or paths) and referenced by URL in the Hub.

## 4. Technical Implementation Details

### 4.1 Three.js 3D Carousel

**Location**: `physics-lab.html` (Script Module)

The carousel is built by placing 3D objects in a circle.

- **Geometry**: Uses `BoxGeometry` to create thick "cards".
- **Positioning**: Cards are positioned using basic trigonometry (`Math.sin`, `Math.cos`) based on their index and the total number of items.
- **Texture Generation**: The `createCardTexture(id, title, description...)` function dynamically generates high-resolution textures using an HTML5 Canvas.

  - It draws gradients, text, and icons onto a 2D canvas.
  - This canvas is then used as a `THREE.CanvasTexture` for the face of the 3D card.
  - **Advantage**: Allows infinite customization of card content without needing external image assets for text.

### 4.2 Automated Deployment Strategy

**Script**: `deploy-unique.ps1`

The project uses a unique "multi-site" deployment architecture to handle the large size and number of simulations.

1. **Architecture**: Instead of one giant site, the project is split into ~25 smaller sites (`sims1`, `sims2`... `hub`).
2. **Script Logic**:

   - Iterates through a list of defined "sites" (folders in `netlify-deploys`).
   - Generates a unique name for each (e.g., `scilab-hubx`, `scilab-sims1`).
   - Runs `netlify deploy --create-site` to provision and deploy them automatically.
   - Logs the final URLs to `deployed-urls.txt`.

### 4.3 Navigation & State

- **Launch Flow**:

  1. User clicks "Launch" on a 3D card.
  2. App navigates to `experiment-wrapper.html?exp=[SIM_URL]&return=[LAB_URL]`.
  3. Wrapper displays loading screen, then shows iframe.
- **Return Flow**:

  1. User clicks "Back to Lab".
  2. Wrapper plays a "Closing..." animation.
  3. App redirects back to the `return` URL parameter (e.g., `physics-lab.html`).

## 5. Development Workflows

### Adding a New Experiment

1. **Deploy Simulation**: Ensure the simulation is deployed to one of the `simsX` Netlify sites. Note its URL.
2. **Update Lab Data**:

   - Open the relevant lab file (e.g., `physics-lab.html`).
   - Locate the `experiments` array in the JavaScript.
   - Add a new object:

     ```javascript

     {

         id: 'my-new-sim',

         title: 'My Simulation',

         description: 'Description of what it does.',

         icon: '🧪', // or generic emoji

         url: 'https://scilab-simsX.netlify.app/my-sim-folder/',

         category: 'Mechanics'

     }

     ```
   - Ensure the `id` maps to an image in `assets/images/physics/[id].png` if you want a custom thumbnail; otherwise, it falls back to the emoji.

### Customizing the Loader

The loading animation in `experiment-wrapper.html` is CSS-driven.

- **Structure**: Look for `.portal-loader` in the HTML.
- **Animation**: Keyframes like `rotateHex`, `spin1`, `orbit1` control the movement.
- **Logic**: The JavaScript `iframe.onload` and `setInterval` control the progress bar timing.

### Deploying Updates

1. **Prepare Build**: Run `prepare-builds.ps1` (if applicable) to copy files to `netlify-deploys`.
2. **Deploy**: Run `deploy-unique.ps1` in PowerShell.

   - *Warning*: This script attempts to create *new* sites. To update existing ones, you might need to modify the script to use `netlify link` or existing Site IDs.

## 6. Key Libraries & Tools

- **Three.js**: Rendering engine for the 3D labs.
- **UnrealBloomPass**: Post-processing for the "glow" effect on UI elements.
- **Netlify CLI**: Used for deployment automation.
- **PhET Libraries** (Internal): `sherpa`, `chipper`, `axon` (used within the simulation codebases, not the Hub itself).

## 7. Configuration & Code Map

This section provides a quick reference for where to find and change specific settings or logic in the code.

### 7.1 Global Settings (Inside `physics-lab.html`, `chemistry-lab.html`, etc.)

These settings are found within the `<script type="module">` block at the bottom of the file.

| Feature | Variable / Function | Description |

| :--- | :--- | :--- |

| **Category Colors** | `categoryThemes` | Defines the specific colors (primary/secondary) used for each category (e.g., Mechanics, Optics). Change hex codes here to update the UI theme. |

| **Sim Data & URLs** | `js/experiments.js` | **NEW:** The central source of truth for all experiments (IDs, Titles, URLs) and Base URL mappings. Edit this file to add/remove experiments globally. |

| **Bloom/Glow** | `bloomPass` | Controls the intensity of the "neon" glow effect. Adjust `bloomPass.strength` or `bloomPass.radius`. |

| **Card Card Resolution** | `createCardTexture` | Inside this function, `width` and `height` determine the canvas resolution. `scale` controls sharpness. |

### 7.2 Functionality Locations

| Functionality | File | Key Code Block / Function |

| :--- | :--- | :--- |

| **Carousel Rotation Logic** | `*-lab.html` | `animate()` loop and `document.addEventListener('touchmove'...)` |

| **Launch Simulation** | `*-lab.html` | `window.launchExperiment = function(...)`. This creates the URL with parameters. |

| **Loading Animation (Hexagon)** | `experiment-wrapper.html` | HTML: `.portal-loader` structure. CSS: `@keyframes rotateHex`, `@keyframes orbit1`. |

| **Loading Progress Logic** | `experiment-wrapper.html` | `setInterval` inside the `<script>` tag. Adjust `Math.random() * X` to change speed. |

| **Deployment Logic** | `deploy-unique.ps1` | `$sites` array lists all folders to deploy. Loop logic handles the `netlify deploy` commands. |

### 7.3 Common "How-To" Changes

**How to change the carousel speed?**

- Go to `*-lab.html`.
- Find the `animate()` function.
- Look for `currentAngle += (targetAngle - currentAngle) * 0.1;`.
- Change `0.1` to a lower number (e.g., `0.05`) for smoother/slower snapping, or higher for snappier movement.

**How to change the background starfield?**

- Go to `*-lab.html`.
- Find the `animateStars()` function and the `stars2D` array setup.
- Adjust the number of stars (loop limit) or their `brightness` logic.
