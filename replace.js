const fs = require('fs');
const path = require('path');

const directoriesToScan = ['flyora-frontend', 'flyora-backend'];
const excludeDirs = ['node_modules', '.git', 'dist', '.next', 'build'];
const excludeFiles = ['package-lock.json', 'replace.js'];

function walkAndReplace(dir) {
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
    // Only process text files by simple extension check or just try reading
    const ext = path.extname(filePath).toLowerCase();
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.pdf', '.zip'];
    if (binaryExts.includes(ext)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Regex to match "flyora" but not followed by "go"
        // Also handling different casings:
        // flyora -> flyorago
        // Flyora -> Flyorago
        // FLYORA -> FLYORAGO
        let updated = false;
        
        const newContent = content.replace(/flyora(?!go)/gi, (match) => {
            updated = true;
            if (match === 'flyora') return 'flyorago';
            if (match === 'Flyora') return 'Flyorago';
            if (match === 'FLYORA') return 'FLYORAGO';
            return 'flyorago'; // fallback
        });

        if (updated) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

directoriesToScan.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) {
        walkAndReplace(fullDir);
    }
});

console.log('Replacement complete.');
