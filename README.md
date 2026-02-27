
# XiaoHeiHe Article Editor (小黑盒文章编辑器)

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[中文](README-zh.md) | [English]

## 🚀  Introduce

A specialized Markdown conversion tool designed for the [XiaoHeiHe](https://xiaoheihe.cn/) (HeyBox) community. It solves the formatting issues when publishing articles from Markdown to the HeyBox rich-text editor, particularly for code blocks and tables.

**🌐 Live Demo:** [evgo2017.com/project/xiaoheihe-editor](https://evgo2017.com/project/xiaoheihe-editor)

![example](./public/assets/example.png)

Want to self-host? One-click deploy to [Vercel](https://vercel.com/) [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fevgo2017%2Fxiaoheihe-editor&env=BASE_PATH&envDefaults=%7B%22BASE_PATH%22%3A%22%2F%22%7D&project-name=xiaoheihe-editor&repository-name=xiaoheihe-editor)

## 🚀 Key Features

- **Markdown Support**: Full Markdown editing experience based on ProseMirror.
- **Synchronized Preview**: Real-time WYSIWYG preview to ensure the layout is perfect.
- **Code to Image**: Since XiaoHeiHe doesn't support code blocks well, this tool automatically renders code snippets into elegant, syntax-highlighted images using a custom Canvas engine.
- **Table to Image**: High-resolution image generation for complex tables, supporting cell text wrapping.
- **Mobile Simulation**: One-click to simulate the 375px mobile view, letting you see exactly what your readers will see on their phones.
- **Auto-Save**: Everything you type is automatically saved to your browser's local storage.
- **One-Click Copy**: Specialized "Copy for HeyBox" logic that cleans up HTML tags to ensure a seamless paste into the platform.

## 📖 Usage

1. Paste or write your Markdown content in the **Source Editing** pane.
2. Check the styles in the **Real-time Preview**.
3. Use the **Mobile Simulation** to fine-tune the layout.
4. Click **One-Click Copy** in the Export pane.
5. Paste directly into the XiaoHeiHe article editor.

---

### 👤 Author

- **GitHub:** [@evgo2017](https://github.com/evgo2017)
- **HeyBox ID:** 93365144 📦

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
