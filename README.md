# Aetheria Builder

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/garlington303/Prototype-WebBuilder)

Aetheria Builder is a state-of-the-art, browser-based visual interface builder and AI-assisted frontend development tool. It empowers users to construct sophisticated user interfaces through a seamless drag-and-drop experience, real-time property editing, and AI-driven component generation.

Designed with a futuristic aesthetic utilizing glassmorphism and subtle gradients, Aetheria Builder bridges the gap between design and development by generating production-ready architectural blueprints.

## 🚀 Key Features

- **Visual Canvas**: An infinite, interactive canvas for dragging, dropping, and arranging UI components.
- **Component Library**: A comprehensive suite of pre-built, customizable components based on shadcn/ui.
- **Real-time Property Editor**: Context-aware properties panel to modify text, colors, spacing, and component variants instantly.
- **Blueprint Generation**: Automatically generates a structured `blueprint.markdown` file reflecting the current project state.
- **Responsive Design**: Tools to preview and adjust layouts across different device sizes.
- **State Management**: Robust component tree management using Zustand for high-performance rendering.
- **Modern Architecture**: Built on a high-performance stack featuring React, Vite, and Cloudflare Workers.

## 🛠️ Technology Stack

**Frontend Core**
- **React 18**: UI Library
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations and interactions

**State & Logic**
- **Zustand**: Global state management (Component Tree)
- **@dnd-kit**: Drag and drop primitives (Core, Sortable, Utilities)
- **React Router DOM**: Client-side routing
- **React Hook Form + Zod**: Form validation and schema management

**UI Components**
- **Shadcn/UI**: Reusable component system
- **Radix UI**: Headless accessible primitives
- **Lucide React**: Iconography

**Backend & Infrastructure**
- **Cloudflare Workers**: Serverless runtime
- **Hono**: Lightweight web framework for the edge
- **Bun**: JavaScript runtime and package manager

## ⚡ Getting Started

### Prerequisites

- **Bun**: This project uses Bun as the package manager and runtime. Ensure you have it installed:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aetheria-builder
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Development

Start the development server:

```bash
bun run dev
```

This will start the Vite development server, typically available at `http://localhost:3000`.

## 📖 Usage

1. **Workspace**: Upon launching, you will enter the main Builder Workspace.
2. **Add Components**: Drag components (Containers, Buttons, Headers) from the Left Sidebar onto the central Canvas.
3. **Edit Properties**: Select any element on the canvas to open the Right Sidebar. Here you can adjust specific properties like text content, variants, and styles.
4. **Generate Blueprint**: Click the "Generate Blueprint" action to view the markdown representation of your current layout.

## 📂 Project Structure

- `src/components`: UI components and layout elements.
- `src/hooks`: Custom React hooks (theme, mobile detection).
- `src/lib`: Utility functions and helpers.
- `src/pages`: Application page views.
- `worker`: Cloudflare Worker backend logic and routes.

## 🚀 Deployment

This project is configured for deployment on Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/garlington303/Prototype-WebBuilder)

### Manual Deployment

To deploy the application manually using Wrangler:

1. Build the project:
   ```bash
   bun run build
   ```

2. Deploy to Cloudflare:
   ```bash
   bun run deploy
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.