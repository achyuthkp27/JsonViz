# <div align="center">**JsonViz**</div>

<div align="center">

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Motion-12.0-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)

**The Premium "Mini-IDE" for JSON Visualization & Manipulation.**
<br />
*Validate, Visualize, Transform, and Share JSON with a stunning, immersive experience.*

[View Demo](#) · [Report Bug](https://github.com/yourusername/jsonviz/issues) · [Request Feature](https://github.com/yourusername/jsonviz/issues)

</div>

---

## ✨ Overview

**JsonViz** is not just another JSON formatter. It is a powerful, design-first workspace built for developers who deal with complex data structures daily. 

Gone are the days of boring textareas. **JsonViz** brings your data to life with:
*   **Immersive Glassmorphism UI**: Beautiful, dark-themed aesthetics with dynamic particle effects.
*   **Performance First**: Virtualized rendering to handle thousands of lines of JSON without lag.
*   **Smart Visualization**: Auto-detection of colors, images, and timestamps within your data.

## 🚀 Key Features

### 🛠 Powerful Editor
*   **Real-time Validation**: Instant syntax checking with precise error details.
*   **Auto-Repair**: Intelligent engine that attempts to fix common JSON errors (missing quotes, trailing commas) with one click.
*   **Smart Controls**: Minify, Sort Keys (Asc/Desc), and Auto-Format.

### 👁️ Multi-Mode Visualization
*   **Tree Explorer**: 
    *   Interactive, collapsible tree view.
    *   **Deep Search & Filter**: Find keys or values nested deep within objects.
    *   **Rich Previews**: Hover over hex codes to see colors, image URLs to see previews, and timestamps to see formatted dates.
*   **Graph Flow** (Beta): Visualize your JSON structure as an interactive node graph using XYFlow.
*   **Query/Transform**: Apply transformations to reshape your data live.

### 💾 Export & Share
*   **Shareable Links**: Generate instant, state-preserving URLs (Base64 encoded) to share code with snippets.
*   **Export Options**: Download your data as `.json` or flattened `.csv` for analysis.

## ⌨️ Shortcuts

| Key Combo | Action |
| :--- | :--- |
| `Ctrl` + `Enter` | **Format** / Validate JSON |
| `Alt` + `Enter` | Switch to **Visualize** Mode |

## 🛠️ Tech Stack

Built with the latest and greatest in the React ecosystem:
*   **Core**: React 19, Vite
*   **Styling**: Tailwind CSS, `tailwind-merge`, `clsx`
*   **Animation**: Framer Motion, React Parallax Tilt
*   **Visualization**: `@xyflow/react` (Graph), `react-virtuoso` (Virtualization)
*   **Icons**: Lucide React

## ⚡ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jsonviz.git
    cd jsonviz
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
