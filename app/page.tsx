import { Hero } from '@/components/chapters/Hero';
import { StoryMap } from '@/components/chapters/StoryMap';
import { GlobalMapChapter } from '@/components/chapters/GlobalMap';
import { SexRaceChapter } from '@/components/chapters/SexRace';
import { ActivityChapter, ConsequencesChapter, SleepChapter } from '@/components/chapters/LifeChapters';
import { OccupationChapter } from '@/components/chapters/Occupation';
import { SodiumChapter } from '@/components/chapters/Sodium';
import { Bridge, ReadingGuide, Sources, Trend } from '@/components/chapters/Narrative';
import { SelfCheck } from '@/components/chapters/SelfCheck';

// The single scrollytelling page, in the narrative order from CLAUDE.md section 9.
export default function Home() {
  return (
    <>
      <Hero />
      <StoryMap />
      <ReadingGuide />
      <GlobalMapChapter />
      <SexRaceChapter />
      <ConsequencesChapter />
      <ActivityChapter />
      <SleepChapter />
      <OccupationChapter />
      <SodiumChapter />
      <Trend />
      <Bridge />
      <SelfCheck />
      <Sources />
    </>
  );
}
