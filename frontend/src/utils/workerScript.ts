export const pyodideWorkerScript = `
/* eslint-disable no-restricted-globals */
const ctx = self;
let pyodide = null;

async function loadPyodide() {
  try {
    ctx.postMessage({ type: 'LOG', message: 'Worker started loading Pyodide' });
    
    // Fallback CDNs
    const cdns = [
      'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
      'https://unpkg.com/pyodide@0.24.1/pyodide.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.24.1/pyodide.min.js'
    ];
    
    let loaded = false;
    for (const cdn of cdns) {
      try {
        ctx.postMessage({ type: 'LOG', message: 'Trying to load from ' + cdn });
        importScripts(cdn);
        loaded = true;
        ctx.postMessage({ type: 'LOG', message: 'Successfully loaded script from ' + cdn });
        break;
      } catch (e) {
        ctx.postMessage({ type: 'LOG', message: 'Failed to load from ' + cdn + ': ' + e });
      }
    }
    
    if (!loaded) {
      throw new Error('Failed to load Pyodide script from any CDN');
    }

    if (!self.loadPyodide) {
      throw new Error('self.loadPyodide is undefined after script load');
    }

    ctx.postMessage({ type: 'LOG', message: 'Starting loadPyodide()' });
    pyodide = await self.loadPyodide();
    ctx.postMessage({ type: 'LOG', message: 'Pyodide initialized' });
    
    ctx.postMessage({ type: 'READY' });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: error.message || String(error) });
  }
}

ctx.onmessage = async (event) => {
  const { type, code, id } = event.data;

  if (type === 'INIT') {
    await loadPyodide();
  } else if (type === 'RUN_CODE') {
    if (!pyodide) {
      ctx.postMessage({ type: 'ERROR', error: 'Python environment not ready', id });
      return;
    }

    try {
      pyodide.setStdout({
        batched: (msg) => {
          ctx.postMessage({ type: 'OUTPUT', output: msg, id });
        }
      });

      const result = await pyodide.runPythonAsync(code);
      
      ctx.postMessage({ 
        type: 'WithResult', 
        result: result !== undefined ? String(result) : '', 
        id 
      });
    } catch (error) {
      ctx.postMessage({ type: 'ERROR', error: error.message, id });
    }
  }
};
`;
