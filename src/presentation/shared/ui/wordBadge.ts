export function getWordTypeBadgeClass(typeStr: string): string {
  const t = (typeStr || '').trim().toLowerCase();
  if (t === 'n' || t.startsWith('noun')) return 'badge-pos-noun';
  if (t === 'v' || t.startsWith('verb')) return 'badge-pos-verb';
  if (t === 'adj' || t.startsWith('adj')) return 'badge-pos-adj';
  if (t === 'adv' || t.startsWith('adv')) return 'badge-pos-adv';
  if (t === 'phrase' || t === 'phr' || t.startsWith('phras')) return 'badge-pos-phrase';
  if (t === 'idiom') return 'badge-pos-idiom';
  return 'badge-pos-default';
}

export function getWordTypeLabel(typeStr: string): string {
  const t = (typeStr || '').trim().toLowerCase();
  if (t === 'n') return 'noun';
  if (t === 'v') return 'verb';
  if (t === 'adj') return 'adj';
  if (t === 'adv') return 'adv';
  return typeStr || 'vocab';
}
