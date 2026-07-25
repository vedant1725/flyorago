const fs = require('fs');
const path = require('path');

const dirToScan = path.join(__dirname, 'flyora-frontend', 'src');

function walkAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkAndReplace(fullPath);
        } else {
            replaceInFile(fullPath);
        }
    }
}

function replaceInFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.tsx', '.ts', '.js', '.jsx'].includes(ext)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // This will match fly<span ...>ora</span>
        // Note: keeping the original capitalization of 'fly' and 'ora' is tricky if they vary, 
        // but looking at grep, they are all lowercase 'fly' and 'ora'. 
        // We can just use a case insensitive match and preserve $1 (the span attributes).
        const regex = /fly<span([^>]+)>ora<\/span>/gi;
        
        const newContent = content.replace(regex, (match, p1) => {
            updated = true;
            return `fly<span${p1}>orago</span>`;
        });

        if (updated) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated Logo in: ${filePath}`);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

walkAndReplace(dirToScan);
console.log('Logo fix complete.');
