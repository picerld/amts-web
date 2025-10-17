const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const http = require("http");

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadURL("http://192.168.1.214:3000").catch((err) => {
    console.error("Failed to load URL:", err);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function waitForServer(url, tries = 0, maxTries = 80) {
  http
    .get(url, () => {
      console.log("✅ Next.js is running. Opening window...");
      createWindow();
    })
    .on("error", () => {
      if (tries < maxTries) {
        console.log(`⏳ Waiting for Next.js... (${tries}/${maxTries})`);
        setTimeout(() => waitForServer(url, tries + 1, maxTries), 500);
      } else {
        console.error("⚠️ Next.js didn't start in time. Opening window anyway.");
        createWindow();
      }
    });
}

app.whenReady().then(() => {
  console.log("🚀 Starting Next.js (npm run start)...");
  nextProcess = exec("npm run start", (err, stdout, stderr) => {
    if (err) console.error("Next.js failed:", err);
    if (stderr) console.error("Next.js stderr:", stderr);
    if (stdout) console.log("Next.js stdout:", stdout);
  });

  waitForServer("http://192.168.1.214:3000");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (nextProcess) {
      console.log("🛑 Stopping Next.js process...");
      nextProcess.kill();
    }
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
