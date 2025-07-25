!/bin/bash

echo "🧼 Starting cleanup..."

 Remove .js files if .ts versions exist
find . -name "*.ts" | while read tsfile; do
    jsfile="${tsfile%.ts}.js"
    if [ -f "$jsfile" ]; then
        echo "🗑️  Would delete: $jsfile"
       rm "$jsfile"

    fi
done

 Remove Apple metadata files
echo "🧹 Scanning for Apple metadata files..."
find . -name "._*" -type f -exec rm {} \;


echo "✅ Dry run complete. Uncomment 'rm' lines to execute real cleanup."

