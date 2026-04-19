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
    
    // Replace header wrapper
    const regex1 = /<div className="flex items-center justify-between">\s*<div>\s*<h1/g;
    content = content.replace(regex1, '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">\n        <div>\n          <h1');
    
    // Some buttons need w-full sm:w-auto
    const regex2 = /<Button onClick=\{([^}]+)\}>\s*<Plus/g;
    content = content.replace(regex2, '<Button className="w-full sm:w-auto" onClick={$1}>\n          <Plus');
    
    const regex3 = /<Button\s+onClick=\{([^}]+)\}\s*>\s*<Plus/g;
    content = content.replace(regex3, '<Button className="w-full sm:w-auto" onClick={$1}>\n          <Plus');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log('Updated: ' + file);
    }
}
console.log('Done. Changed ' + changed + ' files.');
