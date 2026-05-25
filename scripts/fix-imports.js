const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Substituir caminhos que continham '/app/' para apenas '/' 
            // Exemplo: import X from '../app/components' -> import X from '../components'
            // Exemplo: import X from './app/contexts' -> import X from './contexts'
            
            const importRegex = /from\s+['"]([^'"]+)['"]/g;
            content = content.replace(importRegex, (match, p1) => {
                if (p1.includes('/app/')) {
                    modified = true;
                    return `from '${p1.replace('/app/', '/')}'`;
                }
                return match;
            });
            
            // Substituir chamadas BleConfig
            if (content.includes('./BleConfig') || content.includes('../ble/BleConfig')) {
                content = content.replace(/from\s+['"].*BleConfig['"]/g, "from '@dynatech/shared'");
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed imports in:', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, '..', 'apps', 'mobile', 'src'));
console.log('Import fix complete!');
