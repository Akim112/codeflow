# Changelog

## [Unreleased] - Performance Optimization Update

### Changed
- **Pyodide Execution**: Moved from main thread to a dedicated Web Worker to prevent UI freezing and reduce CPU usage.
- **Worker Loading**: Implemented `Blob` based worker initialization to resolve "Failed to load script" errors and avoid CORS/path issues with Vite.
- **Matrix Rain**: Optimized rendering loop to use `requestAnimationFrame` instead of `setInterval`, significantly improving performance.
- **Monaco Editor**: Implemented Lazy Loading (`React.lazy` + `Suspense`) to reduce initial bundle size and speed up Lesson Page loading.
- **Page Transitions**: Replaced heavy `clip-path` animations with GPU-accelerated `transform` and `opacity` transitions.
- **Error Handling**: Added robust error states and visual feedback when the Python engine fails to initialize.

### Fixed
- Fixed critical issue where Pyodide failed to load from CDN by implementing a robust fallback mechanism inside the worker.
- Fixed "Overheating" and "freezing" issues reported on Mac during page transitions and code execution.
