#!/bin/bash

# Sacred Preview Generation System
# Auto-generates waveforms for audio and thumbnails for video

set -e

# Colors for output
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${PURPLE}🎨 Sacred Preview Generation System${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ASSET_BASE="docs/assets"
PREVIEW_BASE="$ASSET_BASE/previews"

# Create preview directories
mkdir -p "$PREVIEW_BASE/audio-waveforms"
mkdir -p "$PREVIEW_BASE/video-thumbnails"
mkdir -p "$PREVIEW_BASE/video-gifs"

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 is not installed. Installing...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install $2 || true
        else
            echo -e "${RED}Please install $1 manually${NC}"
            exit 1
        fi
    fi
}

# Check dependencies
check_tool "ffmpeg" "ffmpeg"
check_tool "node" "node"

# Install audiowaveform if needed (using npm package for simplicity)
if ! command -v audiowaveform &> /dev/null; then
    echo -e "${YELLOW}Installing audiowaveform...${NC}"
    npm install -g audiowaveform-cli || true
fi

# Generate audio waveforms
echo -e "\n${PURPLE}🎵 Generating audio waveforms...${NC}"
for audio_file in $(find "$ASSET_BASE/audio" -type f \( -name "*.mp3" -o -name "*.wav" -o -name "*.m4a" \)); do
    filename=$(basename "$audio_file")
    name="${filename%.*}"
    waveform_path="$PREVIEW_BASE/audio-waveforms/${name}.svg"
    
    if [ ! -f "$waveform_path" ]; then
        echo -e "  Creating waveform for $filename..."
        
        # Generate waveform using ffmpeg + custom SVG creation
        # Extract audio data
        ffmpeg -i "$audio_file" -ac 1 -filter:a aresample=8000 -map 0:a -c:a pcm_s16le -f data - 2>/dev/null | \
        node -e "
            const fs = require('fs');
            let data = '';
            process.stdin.on('data', chunk => data += chunk);
            process.stdin.on('end', () => {
                // Simple waveform SVG generation
                const samples = data.split('\\n').filter(Boolean).map(Number);
                const width = 800;
                const height = 100;
                const step = Math.floor(samples.length / width);
                
                let path = 'M 0 50';
                for (let i = 0; i < width; i++) {
                    const idx = i * step;
                    const val = samples[idx] || 0;
                    const y = 50 - (val / 32768) * 40;
                    path += \` L \${i} \${y}\`;
                }
                
                const svg = \`<svg width='\${width}' height='\${height}' xmlns='http://www.w3.org/2000/svg'>
                    <defs>
                        <linearGradient id='waveGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                            <stop offset='0%' style='stop-color:#d4af37;stop-opacity:1' />
                            <stop offset='100%' style='stop-color:#8b6914;stop-opacity:0.3' />
                        </linearGradient>
                    </defs>
                    <rect width='\${width}' height='\${height}' fill='#000000' opacity='0.1'/>
                    <path d='\${path}' stroke='url(#waveGradient)' stroke-width='2' fill='none'/>
                </svg>\`;
                
                fs.writeFileSync('$waveform_path', svg);
            });
        " 2>/dev/null || {
            # Fallback: create simple placeholder SVG
            cat > "$waveform_path" << EOF
<svg width='800' height='100' xmlns='http://www.w3.org/2000/svg'>
    <rect width='800' height='100' fill='#1a1a1a'/>
    <text x='400' y='50' text-anchor='middle' fill='#d4af37' font-family='monospace'>🎵 ${name}</text>
</svg>
EOF
        }
        
        echo -e "${GREEN}    ✓ Generated $waveform_path${NC}"
    fi
done

# Generate video thumbnails
echo -e "\n${PURPLE}🎥 Generating video thumbnails...${NC}"
for video_file in $(find "$ASSET_BASE/video" -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" \)); do
    filename=$(basename "$video_file")
    name="${filename%.*}"
    thumbnail_path="$PREVIEW_BASE/video-thumbnails/${name}.png"
    gif_path="$PREVIEW_BASE/video-gifs/${name}.gif"
    
    if [ ! -f "$thumbnail_path" ]; then
        echo -e "  Creating thumbnail for $filename..."
        
        # Get video duration
        duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video_file" 2>/dev/null || echo "1")
        
        # Extract frame at midpoint
        midpoint=$(echo "$duration / 2" | bc 2>/dev/null || echo "1")
        
        ffmpeg -ss "$midpoint" -i "$video_file" -vframes 1 -vf "scale=320:-1" "$thumbnail_path" -y 2>/dev/null || {
            # Fallback: create placeholder image
            convert -size 320x180 xc:black \
                -fill '#d4af37' -gravity center \
                -pointsize 24 -annotate +0+0 "🎥 $name" \
                "$thumbnail_path" 2>/dev/null || touch "$thumbnail_path"
        }
        
        echo -e "${GREEN}    ✓ Generated $thumbnail_path${NC}"
    fi
    
    # Optional: Generate GIF preview for motion videos
    if [[ "$video_file" == *"motion"* ]] || [[ "$video_file" == *"holoflower"* ]]; then
        if [ ! -f "$gif_path" ]; then
            echo -e "  Creating GIF preview for $filename..."
            
            ffmpeg -ss 0 -t 5 -i "$video_file" \
                -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
                -loop 0 "$gif_path" -y 2>/dev/null || touch "$gif_path"
            
            echo -e "${GREEN}    ✓ Generated $gif_path${NC}"
        fi
    fi
done

# Update assets manifest
echo -e "\n${PURPLE}📝 Updating assets manifest...${NC}"

node -e "
const fs = require('fs');
const path = require('path');

const assetBase = 'docs/assets';
const manifest = [];

// Process audio files
const audioDir = path.join(assetBase, 'audio');
if (fs.existsSync(audioDir)) {
    const subdirs = ['tones', 'voice', 'music'];
    subdirs.forEach(subdir => {
        const dir = path.join(audioDir, subdir);
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.match(/\.(mp3|wav|m4a|flac)$/)) {
                    const name = file.replace(/\.[^.]+$/, '');
                    const entry = {
                        id: name,
                        type: 'audio',
                        category: subdir,
                        path: path.join('/', assetBase, 'audio', subdir, file),
                        preview: path.join('/', assetBase, 'previews', 'audio-waveforms', name + '.svg')
                    };
                    
                    // Extract frequency if present
                    const freqMatch = file.match(/(\d+)Hz/);
                    if (freqMatch) {
                        entry.frequency = parseInt(freqMatch[1]);
                    }
                    
                    manifest.push(entry);
                }
            });
        }
    });
}

// Process video files
const videoDir = path.join(assetBase, 'video');
if (fs.existsSync(videoDir)) {
    const subdirs = ['demos', 'motion', 'talks'];
    subdirs.forEach(subdir => {
        const dir = path.join(videoDir, subdir);
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.match(/\.(mp4|mov|webm|avi)$/)) {
                    const name = file.replace(/\.[^.]+$/, '');
                    const entry = {
                        id: name,
                        type: 'video',
                        category: subdir,
                        path: path.join('/', assetBase, 'video', subdir, file),
                        preview: path.join('/', assetBase, 'previews', 'video-thumbnails', name + '.png')
                    };
                    
                    // Add GIF if it exists
                    const gifPath = path.join(assetBase, 'previews', 'video-gifs', name + '.gif');
                    if (fs.existsSync(gifPath)) {
                        entry.gif = path.join('/', assetBase, 'previews', 'video-gifs', name + '.gif');
                    }
                    
                    manifest.push(entry);
                }
            });
        }
    });
}

// Process images
const imageDir = path.join(assetBase, 'images');
if (fs.existsSync(imageDir)) {
    fs.readdirSync(imageDir).forEach(file => {
        if (file.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
            const name = file.replace(/\.[^.]+$/, '');
            manifest.push({
                id: name,
                type: 'image',
                path: path.join('/', assetBase, 'images', file),
                preview: path.join('/', assetBase, 'images', file)
            });
        }
    });
}

// Write manifest
fs.writeFileSync(
    path.join(assetBase, 'assets.json'),
    JSON.stringify(manifest, null, 2)
);

console.log('✓ Updated assets.json with ' + manifest.length + ' entries');
"

echo -e "\n${GREEN}✨ Preview generation complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"