const fs = require('fs');
const path = require('path');

const directoriesToScan = ['flyora-frontend', 'flyorago-backend', 'flyora-backend'];
const excludeDirs = ['node_modules', '.git', 'dist', '.next', 'build', '.venv', 'venv'];
const excludeFiles = ['package-lock.json', 'replace.js', 'revert.js'];

function walkAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                walkAndReplace(fullPath);
            }
        } else {
            if (!excludeFiles.includes(file)) {
                replaceInFile(fullPath);
            }
        }
    }
}

function replaceInFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.pdf', '.zip', '.pyc'];
    if (binaryExts.includes(ext)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // We want to revert "flyorago" to "flyora" ONLY when it's used as a technical identifier.
        // E.g., CSS classes, object keys, local storage keys.
        // We match "flyorago" (case-insensitive) if it is preceded by a hyphen/underscore, 
        // OR followed by a hyphen/underscore/colon.
        const regex = /(?<=[-_])flyorago|flyorago(?=[-_\:])/gi;
        
        const newContent = content.replace(regex, (match) => {
            updated = true;
            if (match === 'flyorago') return 'flyora';
            if (match === 'Flyorago') return 'Flyora';
            if (match === 'FLYORAGO') return 'FLYORA';
            return 'flyora';
        });

        if (updated) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Reverted identifiers in: ${filePath}`);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

// Also scan the root directory for config files like tailwind.config.js if any, but we will just pass the project root
const projectRoot = __dirname;
walkAndReplace(projectRoot);

console.log('Revert complete.');
