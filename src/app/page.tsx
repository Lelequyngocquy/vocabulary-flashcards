import { getAllWords, getAllCategories, getDefaultCategory, getDefaultTopic } from '@/lib/db';
import { AppShell } from '@/presentation/AppShell';

export const dynamic = 'force-dynamic';

export default function Page() {
  // Query initial data dynamically from SQLite database model layer
  const words = getAllWords();
  const categories = getAllCategories();
  const defaultCat = getDefaultCategory();
  const defaultTopic = getDefaultTopic(defaultCat.id);

  return (
    <AppShell
      initialWords={words}
      initialCategories={categories}
      defaultCategory={defaultCat.category}
      defaultUnit={defaultTopic}
    />
  );
}
