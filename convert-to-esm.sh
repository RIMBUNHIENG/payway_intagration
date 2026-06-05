#!/bin/bash

# Script to convert CommonJS files to ES Modules

echo "🔄 Converting CommonJS to ES Modules..."

# Function to convert a file
convert_file() {
    local file=$1
    echo "Converting: $file"
    
    # Convert require statements to import
    sed -i '' "s/const \([^=]*\) = require('\([^']*\)');/import \1 from '\2.js';/g" "$file"
    sed -i '' 's/const \([^=]*\) = require("\([^"]*\)");/import \1 from "\2.js";/g' "$file"
    
    # Convert require with destructuring
    sed -i '' "s/const { \([^}]*\) } = require('\([^']*\)');/import { \1 } from '\2.js';/g" "$file"
    sed -i '' 's/const { \([^}]*\) } = require("\([^"]*\)");/import { \1 } from "\2.js";/g' "$file"
    
    # Convert module.exports
    sed -i '' 's/module\.exports = /export default /g' "$file"
    sed -i '' 's/module\.exports\./export /g' "$file"
    sed -i '' 's/exports\./export /g' "$file"
    
    # Fix dotenv
    sed -i '' "s/require('dotenv')\.config();/import 'dotenv\/config';/g" "$file"
    
    # Remove .js.js if added twice
    sed -i '' 's/\.js\.js/.js/g' "$file"
}

# Convert all JavaScript files
find ./src -name "*.js" -type f | while read file; do
    convert_file "$file"
done

convert_file "./server.js"

echo "✅ Conversion complete!"
echo "⚠️  Note: Manual review recommended for complex exports/imports"
