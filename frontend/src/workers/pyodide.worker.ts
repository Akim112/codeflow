/* eslint-disable no-restricted-globals */
// Web Worker для Pyodide

// Определяем типы для глобального скоупа воркера
// @ts-expect-error self is WorkerGlobalScope in worker
const ctx: Worker = self;

interface PyodideRuntime {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (cfg: { batched?: (msg: string) => void }) => void;
}

let pyodide: PyodideRuntime | null = null;

// Инициализация Pyodide
async function loadPyodide() {
    try {
        ctx.postMessage({ type: 'LOG', message: 'Worker started loading Pyodide' });

        const cdns = [
            'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
            'https://unpkg.com/pyodide@0.24.1/pyodide.js',
            'https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.24.1/pyodide.min.js'
        ];

        let loaded = false;
        for (const cdn of cdns) {
            try {
                ctx.postMessage({ type: 'LOG', message: `Trying to load from ${cdn}` });
                // @ts-expect-error importScripts is global in worker
                importScripts(cdn);
                loaded = true;
                ctx.postMessage({ type: 'LOG', message: `Successfully loaded script from ${cdn}` });
                break;
            } catch (err) {
                ctx.postMessage({ type: 'LOG', message: `Failed to load from ${cdn}: ${err}` });
            }
        }

        if (!loaded) {
            throw new Error('Failed to load Pyodide script from any CDN');
        }

        // @ts-expect-error loadPyodide is injected by pyodide script
        if (!self.loadPyodide) {
            throw new Error('self.loadPyodide is undefined after script load');
        }

        ctx.postMessage({ type: 'LOG', message: 'Starting loadPyodide()' });
        // @ts-expect-error loadPyodide is injected by pyodide script
        pyodide = await self.loadPyodide();
        ctx.postMessage({ type: 'LOG', message: 'Pyodide initialized' });

        ctx.postMessage({ type: 'READY' });
    } catch (error: unknown) {
        ctx.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : String(error) });
    }
}

// Обработка сообщений от основного потока
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
            // Перенаправляем stdout
            pyodide.setStdout({
                batched: (msg: string) => {
                    ctx.postMessage({ type: 'OUTPUT', output: msg, id });
                }
            });

            // Выполняем код
            const result = await pyodide.runPythonAsync(code);

            ctx.postMessage({
                type: 'WithResult',
                result: result !== undefined ? String(result) : '',
                id
            });
        } catch (error: unknown) {
            ctx.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : String(error), id });
        }
    }
};
