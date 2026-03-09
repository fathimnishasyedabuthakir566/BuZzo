import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import waitOn from 'wait-on';

// ESM dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let backendProcess;

// Configuration
const FRONTEND_PORT = 8082; // The port user wants
const BACKEND_PORT = 8082; // In prod, backend serves frontend on same port
const DEV_URL = `http://localhost:${FRONTEND_PORT}`;
const PROD_URL = `http://localhost:${BACKEND_PORT}`;

// Determine if we are in development
const isDev = !app.isPackaged;

async function startBackend() {
    if (isDev) {
        console.log('In Development Mode. Backend should be running separately via npm run dev:desktop');
        return;
    }

    console.log('Starting Backend Process...');
    const backendPath = path.join(process.resourcesPath, 'backend', 'server.js');

    // In production, we might need to adjust paths if resources are packed differently
    // Usually with extraResources: ["backend/**"] in electron-builder
    // For local testing of "prod" mode (npm run start:prod), path might be different
    const localBackendPath = path.join(__dirname, '../backend/server.js');

    const scriptPath = app.isPackaged ? backendPath : localBackendPath;

    backendProcess = fork(scriptPath, [], {
        env: {
            ...process.env,
            PORT: BACKEND_PORT,
            NODE_ENV: 'production',
            SERVE_STATIC: 'true'
        },
        stdio: 'inherit'
    });

    console.log(`Backend started with PID: ${backendProcess.pid}`);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Optional if we add one later
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/logo.png') // Custom logo
    });

    const url = isDev ? DEV_URL : PROD_URL;

    console.log(`Loading URL: ${url}`);

    // Wait for the server to be ready before loading
    waitOn({
        resources: [url],
        timeout: 20000, // 20s timeout
        interval: 1000
    }).then(() => {
        mainWindow.loadURL(url);
    }).catch((err) => { // Fixed: using arrow function syntax for catch
        console.error('Server timeout:', err);
        // Fallback or error page could go here
        mainWindow.loadURL(url); // Try anyway
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await startBackend();
    createWindow();

    app.on('activate', () => {
        if (mainWindow === null) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (backendProcess) {
        console.log('Killing backend process...');
        backendProcess.kill();
    }
});
