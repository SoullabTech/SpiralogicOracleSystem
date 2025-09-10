#!/usr/bin/env python3
"""
Extract individual petals from the Spiralogic Holoflower image
Removes white background and saves each petal as a separate transparent PNG
"""

from PIL import Image
import numpy as np
import os
from pathlib import Path

def remove_white_background(image_path, threshold=240):
    """Remove white/near-white pixels from image"""
    img = Image.open(image_path).convert('RGBA')
    data = np.array(img)
    
    # Get RGBA channels
    red, green, blue, alpha = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Find white/near-white pixels
    white_areas = (red > threshold) & (green > threshold) & (blue > threshold)
    
    # Make white pixels transparent
    data[white_areas] = [255, 255, 255, 0]
    
    return Image.fromarray(data, 'RGBA')

def extract_petal_regions(img, num_petals=12):
    """
    Extract 12 petal regions from the holoflower
    Returns list of (x, y, width, height) for each petal
    """
    width, height = img.size
    center_x, center_y = width // 2, height // 2
    
    # Define regions for each petal (clockwise from top)
    # These are approximate - adjust based on your image
    petal_regions = []
    
    for i in range(num_petals):
        angle = (i * 30) - 90  # 12 petals, 30 degrees each
        angle_rad = np.radians(angle)
        
        # Calculate petal position
        # Inner petals (indices 2, 5, 8, 11)
        # Middle petals (indices 1, 4, 7, 10)  
        # Outer petals (indices 0, 3, 6, 9)
        
        if i % 3 == 0:  # Outer petal
            radius = 250
            petal_width = 180
            petal_height = 200
        elif i % 3 == 1:  # Middle petal
            radius = 180
            petal_width = 150
            petal_height = 170
        else:  # Inner petal
            radius = 120
            petal_width = 120
            petal_height = 140
            
        # Calculate top-left corner of petal bounding box
        petal_center_x = center_x + int(radius * np.cos(angle_rad))
        petal_center_y = center_y + int(radius * np.sin(angle_rad))
        
        x = petal_center_x - petal_width // 2
        y = petal_center_y - petal_height // 2
        
        petal_regions.append((x, y, petal_width, petal_height, angle))
    
    return petal_regions

def save_individual_petals(image_path, output_dir):
    """Extract and save each petal as individual PNG"""
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Remove white background
    print("Removing white background...")
    img = remove_white_background(image_path)
    
    # Save cleaned full image
    cleaned_path = output_path / "holoflower_cleaned.png"
    img.save(cleaned_path)
    print(f"Saved cleaned image to {cleaned_path}")
    
    # Extract petal regions
    print("Extracting petals...")
    petal_regions = extract_petal_regions(img)
    
    # Element names for each petal
    elements = ['earth', 'earth', 'earth', 
                'fire', 'fire', 'fire',
                'water', 'water', 'water',
                'air', 'air', 'air']
    
    intensities = ['outer', 'middle', 'inner'] * 4
    
    for i, (x, y, w, h, angle) in enumerate(petal_regions):
        # Crop petal region
        try:
            # Ensure coordinates are within image bounds
            x = max(0, min(x, img.width - w))
            y = max(0, min(y, img.height - h))
            
            petal = img.crop((x, y, x + w, y + h))
            
            # Rotate petal to upright position
            petal = petal.rotate(-angle, expand=True, fillcolor=(0, 0, 0, 0))
            
            # Save petal
            element = elements[i]
            intensity = intensities[i]
            filename = f"petal_{i+1:02d}_{element}_{intensity}.png"
            petal_path = output_path / filename
            petal.save(petal_path)
            
            print(f"Saved petal {i+1}: {filename}")
            
        except Exception as e:
            print(f"Error extracting petal {i+1}: {e}")
    
    print(f"\nExtraction complete! Petals saved to {output_path}")
    
    # Create composite test image
    create_composite_test(output_path)

def create_composite_test(petals_dir):
    """Create a test composite showing all extracted petals"""
    petals_path = Path(petals_dir)
    petal_files = sorted(petals_path.glob("petal_*.png"))
    
    if not petal_files:
        print("No petal files found for composite")
        return
    
    # Create new image for composite
    composite = Image.new('RGBA', (800, 800), (0, 0, 0, 0))
    
    # Arrange petals in circle
    center_x, center_y = 400, 400
    
    for i, petal_file in enumerate(petal_files):
        petal = Image.open(petal_file)
        
        # Calculate position
        angle = (i * 30) - 90
        angle_rad = np.radians(angle)
        radius = 200
        
        x = int(center_x + radius * np.cos(angle_rad) - petal.width // 2)
        y = int(center_y + radius * np.sin(angle_rad) - petal.height // 2)
        
        # Rotate petal
        petal = petal.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))
        
        # Paste onto composite
        composite.paste(petal, (x, y), petal)
    
    # Save composite
    composite_path = petals_path / "composite_test.png"
    composite.save(composite_path)
    print(f"Saved composite test to {composite_path}")

if __name__ == "__main__":
    # Input and output paths
    input_image = "/Users/andreanezat/Desktop/SpiralogicHoloflower_nobg.png"
    output_directory = "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/public/petals"
    
    # Extract petals
    save_individual_petals(input_image, output_directory)