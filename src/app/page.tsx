import { getAllWords } from '@/lib/db';
import { VoltVocabApp } from '@/components/VoltVocabApp';

export const dynamic = 'force-dynamic';

export default function Page() {
  // Query all words directly from SQLite database
  const words = getAllWords();
  return <VoltVocabApp initialWords={words} />;
}
