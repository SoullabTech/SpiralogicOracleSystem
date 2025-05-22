const loadSwisseph = async () => {
  const module = await import('../../public/swisseph.js');
  const swisseph = await module.default();
  return swisseph;
};

export default loadSwisseph;
