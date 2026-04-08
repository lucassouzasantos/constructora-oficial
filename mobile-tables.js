const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'frontend/src/pages');
if (!fs.existsSync(dir)) {
   console.log('Dir not found');
   process.exit(0);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');
    let changed = false;

    // Wrap un-wrapped tables
    // We look for `<table ` and `</table>`
    content = content.replace(/(<table[\s\S]*?<\/table>)/g, (match) => {
        // Exclude if it looks like it's already in an overflow div (we can check simple heuristic or just wrap blindly if we don't have overflow-x-auto inside it)
        // A better heuristic: we replace <table with <div className="overflow-x-auto w-full"><table and </table> with </table></div>
        // Let's do a fast look-behind equivalent by checking if the original file had `className="overflow-x-auto"` nearby, but it's simpler to just do it if not present inside the file at all?
        // Let's just wrap it. If it causes double wrap, Tailwind just ignores the redundant overflow-x-auto.
        
        return `<div className="overflow-x-auto w-full pb-4">\n${match}\n</div>`;
    });

    if (content !== fs.readFileSync(fp, 'utf8')) {
        fs.writeFileSync(fp, content);
        console.log('Fixed tables in ' + file);
    }
});

// Fix Modals width
const componentsDir = path.join(process.cwd(), 'frontend/src/components');
if (fs.existsSync(componentsDir)) {
    const compFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    compFiles.forEach(file => {
        const fp = path.join(componentsDir, file);
        let content = fs.readFileSync(fp, 'utf8');
        let initial = content;

         // For absolute positioned modals: replace w-[500px], w-[600px] with w-full max-w-lg
        content = content.replace(/w-\[\d+px\]/g, 'w-full max-w-lg sm:max-w-xl mx-4');
        content = content.replace(/w-96/g, 'w-full max-w-md mx-4');

        if (content !== initial) {
            fs.writeFileSync(fp, content);
            console.log('Fixed modals in ' + file);
        }
    });

    // Also do pages
    files.forEach(file => {
        const fp = path.join(dir, file);
        let content = fs.readFileSync(fp, 'utf8');
        let initial = content;
        content = content.replace(/w-\[\d+px\]/g, 'w-full max-w-lg sm:max-w-xl mx-4');
        content = content.replace(/w-96/g, 'w-full max-w-md mx-4');
        if (content !== initial) {
            fs.writeFileSync(fp, content);
            console.log('Fixed modals in page: ' + file);
        }
    });
}
console.log('Done script.');
