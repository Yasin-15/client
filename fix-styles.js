const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    }
    return results;
}

const appDir = path.join(__dirname, 'src', 'app');
const files = walk(appDir);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('styles')) {
        let originalContent = content;

        // Replace styles.prop with "prop"
        // We match things like {styles.container}, ${styles.statCard}, etc.

        // 1. Template literals: ${styles.statCard} -> statCard
        content = content.replace(/\$\{styles\.([a-zA-Z0-9]+)\}/g, '$1');

        // 2. JSX attributes: className={styles.container} -> className="container"
        content = content.replace(/className\s*=\s*\{\s*styles\.([a-zA-Z0-9]+)\s*\}/g, 'className="$1"');

        // 3. Any other styles.prop -> "prop"
        content = content.replace(/styles\.([a-zA-Z0-9]+)/g, '"$1"');

        if (content !== originalContent) {
            console.log(`Fixed styles in: ${file}`);
            fs.writeFileSync(file, content);
        }
    }
}
