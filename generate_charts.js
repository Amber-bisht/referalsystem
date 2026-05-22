const fs = require('fs');
const path = require('path');
const https = require('https');

const docsDir = path.join(__dirname, 'docs');
const outputDir = path.join(docsDir, 'assets', 'charts');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('------------------------------------------------------------');
console.log('HNBGU Thesis Chart Downloader — Powered by Mermaid Ink');
console.log('------------------------------------------------------------');

// Scan all markdown files in the docs directory
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

let queue = [];

files.forEach(file => {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /```mermaid([\s\S]*?)```/g;
    let match;
    let index = 1;
    
    while ((match = regex.exec(content)) !== null) {
        const code = match[1].trim();
        const filePrefix = file.replace('.md', '');
        
        // Formulate a descriptive filename by parsing the heading preceding the chart
        const precedingContent = content.substring(0, match.index);
        const lines = precedingContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let label = `diagram_${index}`;
        
        if (lines.length > 0) {
            // Check preceding lines to find headers or titles
            for (let i = lines.length - 1; i >= Math.max(0, lines.length - 4); i--) {
                const line = lines[i];
                if (line.startsWith('#') || line.startsWith('**') || line.match(/^[0-9]\./)) {
                    label = line
                        .replace(/[#*`:\-]/g, '')
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .substring(0, 30); // Cap filename width
                    break;
                }
            }
        }
        
        // Remove trailing or leading underscores
        label = label.replace(/^_+|_+$/g, '');
        if (!label) label = `chart_${index}`;
        
        const fileName = `${filePrefix}_diagram_${index.toString().padStart(2, '0')}_${label}.png`;
        const destPath = path.join(outputDir, fileName);
        
        queue.push({
            code: code,
            dest: destPath,
            name: fileName
        });
        
        index++;
    }
});

console.log(`Found a total of ${queue.length} Mermaid diagrams across your files.`);
console.log('Starting downloading processes (this takes a few seconds)...');

// Process download sequentially to prevent HTTP connection limits
let processed = 0;

function processNext() {
    if (queue.length === 0) {
        console.log('------------------------------------------------------------');
        console.log(`Compilation complete! ${processed} charts successfully saved to:`);
        console.log(`➔ file://${outputDir}`);
        console.log('------------------------------------------------------------');
        return;
    }
    
    const task = queue.shift();
    const obj = {
        code: task.code,
        mermaid: { theme: 'default' }
    };
    const jsonStr = JSON.stringify(obj);
    
    // Create base64url encoded representation
    const base64 = Buffer.from(jsonStr).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
        
    const url = `https://mermaid.ink/img/${base64}`;
    const file = fs.createWriteStream(task.dest);
    
    https.get(url, response => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                processed++;
                console.log(`[${processed}] Saved: ${task.name}`);
                setTimeout(processNext, 500); // 500ms delay to be polite to the API
            });
        } else {
            console.error(`[ERROR] Failed to compile ${task.name} (HTTP ${response.statusCode})`);
            file.close();
            if (fs.existsSync(task.dest)) fs.unlinkSync(task.dest);
            setTimeout(processNext, 500);
        }
    }).on('error', err => {
        console.error(`[ERROR] Network error for ${task.name}:`, err.message);
        file.close();
        if (fs.existsSync(task.dest)) fs.unlinkSync(task.dest);
        setTimeout(processNext, 1000); // Wait longer on net error
    });
}

processNext();
