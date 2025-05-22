const frequencyMapping = {
  tenderness: {
    label: 'Heart Healing 528Hz',
    url: 'https://www.youtube.com/watch?v=528HzHealingSound',
  },
  excitement: {
    label: 'Manifestation 963Hz',
    url: 'https://www.youtube.com/watch?v=963HzManifest',
  },
  grounding: { label: 'Root Stability 396Hz', url: 'https://www.youtube.com/watch?v=396HzEarth' },
  dreamy: { label: 'Theta Dream Waves', url: 'https://www.youtube.com/watch?v=ThetaDreams' },
  unity: { label: 'OM Cosmic Sound 136Hz', url: 'https://www.youtube.com/watch?v=OmSound' },
};

function matchFrequency(state: string) {
  if (state.includes('blossom') || state.includes('tender')) {
    return frequencyMapping.tenderness;
  } else if (state.includes('light') || state.includes('vision')) {
    return frequencyMapping.excitement;
  } else if (state.includes('roots') || state.includes('stable')) {
    return frequencyMapping.grounding;
  } else if (state.includes('dream') || state.includes('air')) {
    return frequencyMapping.dreamy;
  } else if (state.includes('spiral') || state.includes('trust')) {
    return frequencyMapping.unity;
  }
  return null;
}
