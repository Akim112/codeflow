export const pyodideWorkerScript = `
/* eslint-disable no-restricted-globals */
const ctx = self;
let pyodide = null;

async function loadPyodide() {
  try {
    ctx.postMessage({ type: 'LOG', message: 'Worker started loading Pyodide' });
    
    // Fallback CDNs - Trying multiple reliable sources
    const cdns = [
      'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
      'https://unpkg.com/pyodide@0.24.1/pyodide.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.24.1/pyodide.min.js'
    ];
    
    let loaded = false;
    for (const cdn of cdns) {
      try {
        ctx.postMessage({ type: 'LOG', message: 'Trying to load from ' + cdn });
        // Use a timeout for importScripts to fail faster on bad connections
        // Note: importScripts is synchronous, but we can't easily timeout it. 
        // We assume valid URLs.
        importScripts(cdn);
        
        // Basic check if loaded
        if (self.loadPyodide) {
           loaded = true;
           ctx.postMessage({ type: 'LOG', message: 'Successfully loaded script from ' + cdn });
           break;
        }
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
    
    // Prepare Python Debugger Class
    await pyodide.runPythonAsync(\`
import sys
import json

class TraceRunner:
    def __init__(self):
        self.trace_data = []
        self.output_buffer = []

    def trace_calls(self, frame, event, arg):
        if event != 'line':
            return self.trace_calls
        
        # Capture locals - simplified for JSON serialization
        locals_snapshot = {}
        for k, v in frame.f_locals.items():
            if k.startswith('__'): continue
            try:
                # Basic types only
                if isinstance(v, (int, float, str, bool, list, dict, set, tuple, type(None))):
                   locals_snapshot[k] = str(v)
                else:
                   locals_snapshot[k] = f"<{type(v).__name__}>"
            except:
                locals_snapshot[k] = "<unserializable>"

        self.trace_data.append({
            'line': frame.f_lineno,
            'locals': locals_snapshot,
            'stdout': "".join(self.output_buffer)
        })
        return self.trace_calls

    def run_with_trace(self, code):
        self.trace_data = []
        self.output_buffer = []
        
        # Redirect stdout
        class CapturingStdout:
            def __init__(self, buffer):
                self.buffer = buffer
            def write(self, text):
                self.buffer.append(text)
                sys.__stdout__.write(text) # Also print to real stdout
            def flush(self):
                sys.__stdout__.flush()
        
        old_stdout = sys.stdout
        sys.stdout = CapturingStdout(self.output_buffer)
        
        try:
            sys.settrace(self.trace_calls)
            exec(code, {})
        finally:
            sys.settrace(None)
            sys.stdout = old_stdout
            
        return self.trace_data
\`);
    
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
  } else if (type === 'RUN_DEBUG') {
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

      // Use the TraceRunner we defined earlier
      // We need to pass the code as a string properly escaped
      // Easier way: set a global variable with the code
      pyodide.globals.set("user_code_to_debug", code);
      
      const traceRunner = pyodide.runPython(\`
runner = TraceRunner()
data = runner.run_with_trace(user_code_to_debug)
import json
json.dumps(data)
\`);
      
      const traceData = JSON.parse(traceRunner);

      ctx.postMessage({ 
        type: 'DEBUG_TRACE', 
        trace: traceData, 
        id 
      });
    } catch (error) {
      ctx.postMessage({ type: 'ERROR', error: error.message, id });
    }
  }
};
`;
