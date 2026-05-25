const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (file.includes('screens')) {
        content = content.replace(/from\s+["']\.\.\/common\/Logo["']/g, 'from "../components/common/Logo"');
        content = content.replace(/from\s+["']\.\.\/common\/BottomNav["']/g, 'from "../components/common/BottomNav"');
        content = content.replace(/from\s+["']\.\.\/\.\.\/contexts/g, 'from "../contexts');
        content = content.replace(/from\s+["']\.\.\/\.\.\/hooks/g, 'from "../hooks');
        content = content.replace(/from\s+["']\.\.\/\.\.\/services/g, 'from "../services');
        content = content.replace(/from\s+["']\.\.\/\.\.\/styles/g, 'from "../styles');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});
