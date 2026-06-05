#!/usr/bin/env python3
import os
import re
import glob

def convert_to_esm(file_path):
    """Convert a CommonJS file to ES Module"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Convert require('dotenv').config()
    content = re.sub(
        r"require\(['\"]dotenv['\"]\)\.config\(\);?",
        "import 'dotenv/config';",
        content
    )
    
    # Convert const { X, Y } = require('module')
    content = re.sub(
        r"const\s+{\s*([^}]+)\s*}\s*=\s*require\(['\"]([^'\"]+)['\"]\);?",
        lambda m: f"import {{ {m.group(1)} }} from '{m.group(2)}.js';",
        content
    )
    
    # Convert const X = require('module')
    content = re.sub(
        r"const\s+(\w+)\s*=\s*require\(['\"]([^'\"]+)['\"]\);?",
        lambda m: f"import {m.group(1)} from '{m.group(2)}.js';",
        content
    )
    
    # Convert module.exports = X
    content = re.sub(
        r"module\.exports\s*=\s*",
        "export default ",
        content
    )
    
    # Convert module.exports.X
    content = re.sub(
        r"module\.exports\.(\w+)",
        r"export const \1",
        content
    )
    
    # Convert exports.X
    content = re.sub(
        r"exports\.(\w+)",
        r"export const \1",
        content
    )
    
    # Fix double .js.js
    content = re.sub(r'\.js\.js', '.js', content)
    
    # Fix imports from node_modules (remove .js)
    node_modules = ['express', 'cors', 'body-parser', 'stripe', 'sequelize', 'bcrypt', 'jsonwebtoken', 'node-cron']
    for module in node_modules:
        content = re.sub(f"from '{module}\\.js'", f"from '{module}'", content)
        content = re.sub(f'from "{module}\\.js"', f'from "{module}"', content)
    
    # Write back if changed
    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ Converted: {file_path}")
        return True
    else:
        print(f"⏭️  Skipped: {file_path} (no changes)")
        return False

def main():
    print("🔄 Converting CommonJS to ES Modules...\n")
    
    # Get all JS files
    js_files = []
    js_files.extend(glob.glob('src/**/*.js', recursive=True))
    js_files.append('server.js')
    
    converted = 0
    for file_path in js_files:
        if os.path.isfile(file_path):
            if convert_to_esm(file_path):
                converted += 1
    
    print(f"\n✅ Conversion complete! {converted}/{len(js_files)} files converted")
    print("⚠️  Manual review recommended for:")
    print("   - Complex exports")
    print("   - Dynamic requires")
    print("   - Conditional imports")

if __name__ == '__main__':
    main()
