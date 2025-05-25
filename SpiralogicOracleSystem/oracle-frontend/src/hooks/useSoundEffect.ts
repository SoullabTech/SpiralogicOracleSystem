export function useSoundEffect(soundUrl: string) {
  const play = () => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  return play;
}
