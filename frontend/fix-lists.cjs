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
    
    // Replace <div className="flex items-start justify-between gap-4"> inside CardContent
    const regex1 = /<div className="flex items-start justify-between gap-4">/g;
    content = content.replace(regex1, '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">');

    // Also look for justify-between in the list items (flex items-center justify-between gap-x)
    const regex2 = /className="flex items-center justify-between gap-/g;
    content = content.replace(regex2, 'className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-');
    
    // Also look for justify-between p-x
    const regex3 = /className="flex items-center justify-between p-/g;
    content = content.replace(regex3, 'className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log('Updated: ' + file);
    }
}
console.log('Done. Changed ' + changed + ' files.');
