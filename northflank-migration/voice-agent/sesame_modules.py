"""
Sesame CSM Module Components
Core vocoder and utilities for Sesame CSM TTS
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, Any, Optional, Tuple
import requests
import os
from pathlib import Path

class SesameVocoder(nn.Module):
    """
    Vocoder for Sesame CSM - converts mel spectrograms to waveforms
    """
    def __init__(self, 
                 n_mel_channels: int = 80,
                 n_fft: int = 1024,
                 hop_length: int = 256,
                 win_length: int = 1024,
                 sampling_rate: int = 22050,
                 device: str = "cuda"):
        super().__init__()
        self.n_mel_channels = n_mel_channels
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.win_length = win_length
        self.sampling_rate = sampling_rate
        self.device = device
        
        # Vocoder layers
        self.conv_pre = nn.Conv1d(n_mel_channels, 512, 7, padding=3)
        
        # Upsampling layers
        self.ups = nn.ModuleList([
            nn.ConvTranspose1d(512, 256, 16, 8, padding=4),
            nn.ConvTranspose1d(256, 128, 16, 8, padding=4),
            nn.ConvTranspose1d(128, 64, 4, 2, padding=1),
            nn.ConvTranspose1d(64, 32, 4, 2, padding=1),
        ])
        
        # Residual blocks
        self.resblocks = nn.ModuleList([
            ResidualBlock(512, 3, [1, 3, 5]),
            ResidualBlock(256, 3, [1, 3, 5]),
            ResidualBlock(128, 3, [1, 3, 5]),
            ResidualBlock(64, 3, [1, 3, 5]),
            ResidualBlock(32, 3, [1, 3, 5]),
        ])
        
        self.conv_post = nn.Conv1d(32, 1, 7, padding=3)
        self.to(device)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Convert mel spectrogram to waveform
        Args:
            x: Mel spectrogram [B, n_mel_channels, T]
        Returns:
            Waveform [B, 1, T * hop_length]
        """
        x = self.conv_pre(x)
        
        for i, (up, resblock) in enumerate(zip(self.ups, self.resblocks[:-1])):
            x = F.leaky_relu(x, 0.1)
            x = up(x)
            x = resblock(x)
        
        x = F.leaky_relu(x, 0.1)
        x = self.resblocks[-1](x)
        x = self.conv_post(x)
        x = torch.tanh(x)
        
        return x


class ResidualBlock(nn.Module):
    """Residual block for vocoder"""
    def __init__(self, channels: int, kernel_size: int, dilations: list):
        super().__init__()
        self.convs = nn.ModuleList([
            nn.Conv1d(channels, channels, kernel_size, 
                     dilation=d, padding=(kernel_size * d - d) // 2)
            for d in dilations
        ])
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for conv in self.convs:
            res = conv(x)
            res = F.leaky_relu(res, 0.1)
            x = x + res
        return x


def load_checkpoint(checkpoint_name: str, cache_dir: str = "models") -> Dict[str, Any]:
    """
    Load model checkpoint from HuggingFace or cache
    """
    cache_path = Path(cache_dir) / checkpoint_name
    cache_path.parent.mkdir(exist_ok=True)
    
    if cache_path.exists():
        return torch.load(cache_path, map_location="cpu")
    
    # Download from HuggingFace
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise ValueError("HF_TOKEN environment variable not set")
    
    url = f"https://huggingface.co/sesame-street/csm-vocoder/resolve/main/{checkpoint_name}"
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    response = requests.get(url, headers=headers, stream=True)
    response.raise_for_status()
    
    # Save to cache
    with open(cache_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return torch.load(cache_path, map_location="cpu")


class MayaTextProcessor:
    """
    Text preprocessing specifically tuned for Maya's speaking style
    """
    def __init__(self):
        self.replacements = {
            # Contractions for natural flow
            "cannot": "can't",
            "will not": "won't",
            "do not": "don't",
            # Emphasis markers
            "important": "*important*",
            "remember": "*remember*",
            "wisdom": "*wisdom*",
        }
    
    def process(self, text: str) -> str:
        """Apply Maya-specific text processing"""
        # Apply replacements
        for old, new in self.replacements.items():
            text = text.replace(old, new)
        
        # Add pauses for contemplative delivery
        text = text.replace("...", " <pause:medium> ")
        text = text.replace(". ", ". <pause:short> ")
        text = text.replace("? ", "? <pause:short> ")
        
        # Add breathing spaces for longer sentences
        sentences = text.split(". ")
        processed = []
        for sent in sentences:
            if len(sent.split()) > 15:
                # Add micro-pause in long sentences
                words = sent.split()
                mid = len(words) // 2
                sent = " ".join(words[:mid]) + " <pause:micro> " + " ".join(words[mid:])
            processed.append(sent)
        
        return ". ".join(processed)


def mel_to_audio(mel_spectrogram: torch.Tensor, 
                 vocoder: SesameVocoder,
                 denormalize: bool = True) -> torch.Tensor:
    """
    Convert mel spectrogram to audio waveform
    """
    if denormalize:
        # Denormalize mel spectrogram (assuming normalized to [-1, 1])
        mel_spectrogram = mel_spectrogram * 2.0
    
    with torch.no_grad():
        audio = vocoder(mel_spectrogram)
    
    # Remove batch and channel dimensions if present
    if audio.dim() == 3:
        audio = audio.squeeze(0).squeeze(0)
    elif audio.dim() == 2:
        audio = audio.squeeze(0)
    
    return audio


def create_mel_filters(sr: int, n_fft: int, n_mels: int = 80,
                      fmin: float = 0.0, fmax: Optional[float] = None) -> torch.Tensor:
    """
    Create mel filterbank for spectrogram computation
    """
    if fmax is None:
        fmax = sr / 2.0
    
    # Initialize mel filterbank
    weights = torch.zeros((n_mels, n_fft // 2 + 1))
    
    # Convert frequency to mel scale
    mel_min = 2595 * np.log10(1 + fmin / 700)
    mel_max = 2595 * np.log10(1 + fmax / 700)
    
    # Create mel points
    mel_points = torch.linspace(mel_min, mel_max, n_mels + 2)
    freq_points = 700 * (10 ** (mel_points / 2595) - 1)
    
    # Convert to FFT bin numbers
    bins = torch.floor((n_fft + 1) * freq_points / sr).long()
    
    # Create triangular filters
    for i in range(n_mels):
        left = bins[i].item()
        center = bins[i + 1].item()
        right = bins[i + 2].item()
        
        # Rising edge
        for j in range(left, center):
            weights[i, j] = (j - left) / (center - left)
        
        # Falling edge
        for j in range(center, right):
            weights[i, j] = (right - j) / (right - center)
    
    return weights