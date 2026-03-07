const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'The Godfather', 'Downloads', 'calor-x', 'calor-x', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
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

const files = walk(srcDir);

const replacements = [
    { from: /#FF4500/gi, to: '#6C63FF' }, // Primary: Soft Purple
    { from: /#FF8C00/gi, to: '#43E97B' }, // Accent: Mint Green
    { from: /#FFF5F0/gi, to: '#F8F8FC' }, // Background
    { from: /#FF6B35/gi, to: '#FF6584' }, // Secondary: Coral
    { from: /#B8860B/gi, to: '#6C63FF' }, // Was dark gold, mapped to purple
    { from: /#FFE8E0/gi, to: '#F0EFFF' }, // Was light border, mapped to light purple
    { from: /rgba\(212, 175, 55/gi, to: 'rgba(108, 99, 255' }, // Gold rgba -> Purple rgba
    { from: /rgba\(255, 69, 0/gi, to: 'rgba(108, 99, 255' }, // Orange rgba -> Purple rgba
    { from: /bg-\[\#FF4500\]\/10/g, to: 'bg-[#F0EFFF]' },
    { from: /bg-\[\#FF4500\]\/5/g, to: 'bg-[#F8F8FC]' },
    { from: /text-white shadow-lg\"\s*style=\{\{\s*background:\s*\"\#[a-zA-Z0-9]+\"\s*\}\}/g, to: 'text-[#1A1A2E] shadow-[0_4px_20px_rgba(108,99,255,0.03)]" style={{ background: "#FFFFFF" }}' },
];

let updatedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFiles++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${updatedFiles} files.`);
