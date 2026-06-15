# Science Hub - Project Documentation

## 1. Project Overview

**Science Hub** is a centralized, immersive 3D web platform designed to host and launch interactive educational science simulations. While built with a strong focus on PhET simulations, the architecture is **universal**, allowing for the integration of any web-based open-source laboratory experiment (HTML5, WebGL, etc.).

The project features:

- **Immersive 3D Navigation**: A Three.js-based carousel interface for browsing experiments in Physics, Chemistry, and Biology.
- **Universal Experiment Wrapper**: A unified interface (`experiment-wrapper.html`) that loads simulations in an `iframe`, providing consistent UI controls (Back button, Title, Loading states) regardless of the simulation's source.
- **Scalable Deployment**: A split-site deployment architecture (using Netlify) to handle large libraries of self-hosted simulations.

---

## 2. Directory Structure

The project is organized as a monorepo containing the main Hub application and the simulation codebases.

```text

/

├── index.html                   # Main Landing Page / Hub Entry

├── physics-lab.html             # Physics Lab 3D Environment

├── chemistry-lab.html           # Chemistry Lab 3D Environment

├── biology-lab.html             # Biology Lab 3D Environment

├── experiment-wrapper.html      # The Universal Launcher (loads all sims)

├── js/

│   ├── experiments.js           # MASTER DATABASE of all experiments

│   └── ...

├── assets/                      # Shared images, textures, icons

├── deploy-unique.ps1            # Automated multi-site deployment script

├── netlify-deploys/             # Staging area for deployments

└── [sim-repo-name]/             # Individual PhET simulation folders

```

---

## 3. Adding New Experiments

The system is designed to be agnostic. You can add **ANY** web-based experiment, whether it is a local PhET simulation or an external open-source tool.

### A. How to Add ANY Open Source Lab (Non-PhET)

**You are not limited to PhET simulations.** You can add any experiment from the web (e.g., from *The Concord Consortium*, *Falstad Circuit*, *ChemCollective*, or your own custom HTML5 tools).

1. **Open the Registry**: Navigate to `js/experiments.js`.
2. **Add an Entry**: Add a new object to the `experiments` array.
3. **Specify the URL**: Set the `url` property to the external link.

**Example: Adding an External Circuit Simulator**

```javascript

{

    id: 'falstad-circuit',

    title: 'Falstad Circuit',

    description: 'Real-time open source circuit simulator.',

    icon: '🔌',

    // DIRECT EXTERNAL LINK

    url: 'https://www.falstad.com/circuit/circuitjs.html',

    category: 'Electronics',

    lab: 'physics'// Appears in the Physics Lab carousel

},

```

**Example: Adding a Custom/Local HTML5 Experiment**

If you have a custom `index.html` file for an experiment you built:

1. Place your experiment folder in the root (e.g., `/my-custom-lab/`).
2. Add it to `js/experiments.js`:

```javascript

{

    id: 'my-custom-lab',

    title: 'My Custom Lab',

    description: 'A custom experiment I built.',

    icon: '🧪',

    url: './my-custom-lab/index.html', // Relative path

    category: 'Custom',

    lab: 'chemistry'

}

```

### B. Adding PhET Simulations

1. **Download/Clone**: Place the PhET simulation folder in the project root.
2. **Deploy (Optional)**: If using the split-deployment system, ensure it's uploaded to one of the `simsX` sites.
3. **Register**: Add it to `js/experiments.js` using the appropriate base URL or relative path.

---

## 4. Technical Architecture

### The 3D Lab Interface (`*-lab.html`)

- **Engine**: Three.js
- **Function**: Renders a 3D carousel of "cards".
- **Data Source**: It imports `experiments` from `js/experiments.js` and filters them by lab type (e.g., `lab: 'physics'`).
- **Textures**: Card textures (Titles, Descriptions) are dynamically generated using HTML5 Canvas APIs, so no static images are required for text.

### The Experiment Wrapper (`experiment-wrapper.html`)

- **Function**: Acts as the "Player" for all experiments.
- **Logic**:

  1. Reads the `?id=...` parameter from the URL.
  2. Lookups the experiment details in `js/experiments.js`.
  3. Sets the `src` of an internal `<iframe>` to the experiment's `url`.
  4. Displays a loading animation while the iframe loads.
- **Universal Compatibility**: Because it uses an `iframe`, it can load any content that permits embedding (some sites block iframes via `X-Frame-Options`, but most educational tools allow it).

---

## 5. Development & Deployment

### Running Locally

To test the project, you need a local web server (because of Module security policies in browsers).

1. Open a terminal in the project root.
2. Run a simple server:

   * **Node/NPM**: `npx serve .`
   * **Python**: `python -m http.server`
3. Open `http://localhost:3000` (or the port shown).

### Deploying to Production

The project uses a custom PowerShell script (`deploy-unique.ps1`) to handle the massive size of multiple PhET simulations.

- **Strategy**: "Sharded" Deployment.
- **Why**: Netlify/Vercel have size limits per site.
- **How it works**: The script splits the simulations into multiple "buckets" (folders) and deploys them to separate Netlify subdomains (`scilab-sims1`, `scilab-sims2`, etc.), while the main Hub (`scilab-hub`) links to them.

**To Deploy:**

1. Ensure you have the Netlify CLI installed and logged in.
2. Run `.\deploy-unique.ps1` in PowerShell.

---

## 6. Customization Guide

| Feature | File to Edit | Description |

| :--- | :--- | :--- |

| **Add/Remove Experiments** | `js/experiments.js` | The database of all available labs. |

| **Change Sim Categories** | `js/experiments.js` | Change the `category` string. |

| **3D Visual Settings** | `physics-lab.html` | Edit `categoryThemes` for colors, or `bloomPass` for glow. |

| **Loading Animation** | `experiment-wrapper.html` | CSS classes under `.portal-loader`. |
