/**
 * Character Select Route
 * Appears after PSX Intro Panel, before entering Void world
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CharacterSelectWindow from '@/components/character-select/CharacterSelectWindow';
import { hasSelectedCharacter } from '@/lib/net/characterStorage';

export default function CharacterSelectPage() {
  const router = useRouter();
  
  // Check if already selected (for returning users)
  useEffect(() => {
    hasSelectedCharacter().then((hasSelected) => {
      // Optional: Auto-skip if already selected
      // Uncomment to enable auto-skip:
      // if (hasSelected) {
      //   router.push('/world');
      // }
    });
  }, [router]);
  
  return <CharacterSelectWindow />;
}
