#!/bin/bash

# Generate PWA icons from Soullab logo
# Requires ImageMagick (brew install imagemagick)

SOURCE_IMAGE="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/public/soullab-logo.png"
ICON_DIR="/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$ICON_DIR"

# Generate various icon sizes for PWA
echo "Generating PWA icons..."

# Standard PWA sizes
sips -z 72 72 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-72x72.png"
sips -z 96 96 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-96x96.png"
sips -z 128 128 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-128x128.png"
sips -z 144 144 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-144x144.png"
sips -z 152 152 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-152x152.png"
sips -z 192 192 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-192x192.png"
sips -z 384 384 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-384x384.png"
sips -z 512 512 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-512x512.png"

# Favicon sizes
sips -z 16 16 "$SOURCE_IMAGE" --out "$ICON_DIR/favicon-16x16.png"
sips -z 32 32 "$SOURCE_IMAGE" --out "$ICON_DIR/favicon-32x32.png"
sips -z 48 48 "$SOURCE_IMAGE" --out "$ICON_DIR/favicon-48x48.png"
sips -z 64 64 "$SOURCE_IMAGE" --out "$ICON_DIR/favicon-64x64.png"

# Apple Touch Icon
sips -z 180 180 "$SOURCE_IMAGE" --out "$ICON_DIR/apple-touch-icon.png"

echo "Icons generated successfully!"
echo "Generated icons in: $ICON_DIR"