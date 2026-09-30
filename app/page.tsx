import { LivingScoreApp } from '@/src/features/design-lab/LivingScoreApp';

export const metadata = {
  title: 'Sargam · Your music, in your Sa',
  description: 'Explore playable Sargam scores and practice on bansuri, harmonium or piano. Bring your own score or try the clearly labelled transcription demo.',
};

export default function HomePage() {
  return <LivingScoreApp direction="mehfil" published />;
}
