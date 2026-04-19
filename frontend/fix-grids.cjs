const fs = require('fs');
const path = require('path');

function getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    });
    return Array.prototype.concat(...files);
}

const files = getFiles('d:/VienLink/frontend/src/pages').filter(f => f.endsWith('.jsx'));

let changed = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Replace grid-cols-2 to be responsive grid-cols-1 sm:grid-cols-2
    // Need to avoid replacing when it's already part of sm:grid-cols-2 or md:grid-cols-2
    // We target specifically 'className="grid grid-cols-2'
    
    content = content.replace(/className="grid grid-cols-2\b/g, 'className="grid grid-cols-1 sm:grid-cols-2');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log('Updated: ' + file);
    }
}
console.log('Done. Changed ' + changed + ' files.');
