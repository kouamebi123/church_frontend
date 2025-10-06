import { renderHook } from '@testing-library/react';
import { useOptimizedData, useOptimizedFilters, useOptimizedPagination, useOptimizedStats } from '../../hooks/useOptimizedData';

describe('useOptimizedData', () => {
  it('returns empty array for null data', () => {
    const { result } = renderHook(() => useOptimizedData(null));
    expect(result.current).toEqual([]);
  });

  it('returns empty array for undefined data', () => {
    const { result } = renderHook(() => useOptimizedData(undefined));
    expect(result.current).toEqual([]);
  });

  it('processes data correctly', () => {
    const testData = [
      { id: 1, username: 'John', status: 'active' },
      { id: 2, nom: 'Jane', status: 'inactive' }
    ];

    const { result } = renderHook(() => useOptimizedData(testData));

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual({
      id: 1,
      username: 'John',
      status: 'active',
      displayName: 'John',
      isActive: true
    });
    expect(result.current[1]).toEqual({
      id: 2,
      nom: 'Jane',
      status: 'inactive',
      displayName: 'Jane',
      isActive: false
    });
  });
});

describe('useOptimizedFilters', () => {
  const testData = [
    { username: 'John', role: 'admin', qualification: 'leader', genre: 'Homme' },
    { username: 'Jane', role: 'user', qualification: 'member', genre: 'Femme' },
    { username: 'Bob', role: 'admin', qualification: 'leader', genre: 'Homme' }
  ];

  it('returns all data when no filters applied', () => {
    const { result } = renderHook(() => useOptimizedFilters(testData, {}));
    expect(result.current).toHaveLength(3);
  });

  it('filters by search term', () => {
    const { result } = renderHook(() => useOptimizedFilters(testData, { search: 'John' }));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].username).toBe('John');
  });

  it('filters by role', () => {
    const { result } = renderHook(() => useOptimizedFilters(testData, { role: 'admin' }));
    expect(result.current).toHaveLength(2);
    expect(result.current.every(item => item.role === 'admin')).toBe(true);
  });

  it('filters by multiple criteria', () => {
    const { result } = renderHook(() =>
      useOptimizedFilters(testData, {
        role: 'admin',
        qualification: 'leader'
      })
    );
    expect(result.current).toHaveLength(2);
  });
});

describe('useOptimizedPagination', () => {
  const testData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('paginates data correctly', () => {
    const { result } = renderHook(() => useOptimizedPagination(testData, 0, 10));

    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.totalPages).toBe(3);
  });

  it('handles empty data', () => {
    const { result } = renderHook(() => useOptimizedPagination([], 0, 10));

    expect(result.current.paginatedData).toHaveLength(0);
    expect(result.current.totalPages).toBe(0);
  });
});

describe('useOptimizedStats', () => {
  const testData = [
    { role: 'admin', qualification: 'leader', genre: 'Homme' },
    { role: 'user', qualification: 'member', genre: 'Femme' },
    { role: 'admin', qualification: 'leader', genre: 'Homme' }
  ];

  it('calculates statistics correctly', () => {
    const { result } = renderHook(() => useOptimizedStats(testData));

    expect(result.current.total).toBe(3);
    expect(result.current.byRole.admin).toBe(2);
    expect(result.current.byRole.user).toBe(1);
    expect(result.current.byQualification.leader).toBe(2);
    expect(result.current.byGenre.Homme).toBe(2);
  });

  it('handles empty data', () => {
    const { result } = renderHook(() => useOptimizedStats([]));

    expect(result.current.total).toBe(0);
    expect(result.current.byRole).toEqual({});
    expect(result.current.byQualification).toEqual({});
    expect(result.current.byGenre).toEqual({});
  });
});