import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Ensure the namecheap-build directory exists
const buildDir = path.join(rootDir, 'namecheap-build');
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
}
fs.mkdirSync(buildDir);

console.log('Packaging for Namecheap Shared Hosting...');

// 1. Copy Frontend Build (dist)
const distSrc = path.join(rootDir, 'dist');
const distDest = path.join(buildDir, 'dist');
if (fs.existsSync(distSrc)) {
    fs.cpSync(distSrc, distDest, { recursive: true });
    console.log('- Copied compiled frontend (dist/)');
}

// 2. Copy Backend API (api)
const apiSrc = path.join(rootDir, 'api');
const apiDest = path.join(buildDir, 'api');
if (fs.existsSync(apiSrc)) {
    fs.cpSync(apiSrc, apiDest, { recursive: true });
    console.log('- Copied backend source (api/)');
}

// 3. Copy app.js (Passenger Entrypoint)
fs.copyFileSync(path.join(rootDir, 'app.js'), path.join(buildDir, 'app.js'));
console.log('- Copied Phusion Passenger entrypoint (app.js)');

// 4. Copy package.json (Dependency resolution and start scripts)
const packageJsonParams = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
// We only need production dependencies for namecheap
delete packageJsonParams.devDependencies;
packageJsonParams.scripts = {
    start: "node app.js"
};
fs.writeFileSync(path.join(buildDir, 'package.json'), JSON.stringify(packageJsonParams, null, 2));
console.log('- Prepared production package.json');

console.log('\n✅ Build Ready! Upload the contents of "namecheap-build" folder directly to your Namecheap File Manager.');
