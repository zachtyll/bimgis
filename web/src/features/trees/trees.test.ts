import { describe, expect, it } from 'vitest';

import { formOf, heightOf, mergeTrees, text, type Tree } from './trees';

const tree = (id: string, x: number, y: number, source: Tree['source'] = 'lulea'): Tree => ({
  id, x, y, groundZ: null, height: 10, heightKnown: true, form: 'broadleaf',
  species: null, latin: null, genus: null, source,
});

describe('trees', () => {
  it('keeps OSM trees only where Luleå has none nearby', () => {
    const lulea = [tree('a', 0, 0), tree('b', 100, 100)];
    const osm = [tree('same-as-a', 2.5, 1, 'osm'), tree('elsewhere', 50, 0, 'osm'), tree('next-cell', 103.9, 100, 'osm')];
    expect(mergeTrees(lulea, osm).map((t) => t.id)).toEqual(['a', 'b', 'elsewhere']);
  });

  it('tells conifers from broadleaves', () => {
    expect(formOf('Pinus')).toBe('conifer');
    expect(formOf('Picea abies')).toBe('conifer');
    expect(formOf('Betula')).toBe('broadleaf');
    expect(formOf(null, 'needleleaved')).toBe('conifer');
    expect(formOf(null)).toBe('broadleaf');
  });

  it('replaces implausible heights with defaults', () => {
    expect(heightOf(14.5, 'broadleaf')).toEqual({ height: 14.5, known: true });
    expect(heightOf(-1.4, 'broadleaf')).toEqual({ height: 9, known: false });
    expect(heightOf(null, 'conifer')).toEqual({ height: 12, known: false });
  });

  it('treats blank names as missing', () => {
    expect(text(' ')).toBeNull();
    expect(text('Vårtbjörk ')).toBe('Vårtbjörk');
  });
});
