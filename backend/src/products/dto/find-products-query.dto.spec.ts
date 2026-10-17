import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindProductsQueryDto } from './find-products-query.dto.js';

// query params arrive as strings; assertions are about what survives coercion
const errorsFor = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(FindProductsQueryDto, payload);
  return (await validate(dto)).map((error) => error.property);
};

describe('FindProductsQueryDto', () => {
  it('accepts an empty query', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  it('coerces page/limit from strings and trims q', async () => {
    const dto = plainToInstance(FindProductsQueryDto, {
      page: '2',
      limit: '5',
      q: '  lcd  ',
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto).toMatchObject({ page: 2, limit: 5, q: 'lcd' });
  });

  it('rejects page 0, a fractional page and a non-numeric page', async () => {
    expect(await errorsFor({ page: '0' })).toContain('page');
    expect(await errorsFor({ page: '2.5' })).toContain('page');
    expect(await errorsFor({ page: 'abc' })).toContain('page');
  });

  it('rejects a limit above 50 or below 1', async () => {
    expect(await errorsFor({ limit: '51' })).toContain('limit');
    expect(await errorsFor({ limit: '0' })).toContain('limit');
  });

  it('rejects a q longer than 100 chars', async () => {
    expect(await errorsFor({ q: 'x'.repeat(101) })).toContain('q');
    expect(await errorsFor({ q: 'x'.repeat(100) })).toEqual([]);
  });

  it('folds category to trimmed lowercase', async () => {
    const dto = plainToInstance(FindProductsQueryDto, {
      category: '  Sensors  ',
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto.category).toBe('sensors');
  });

  it('rejects a category longer than 50 chars', async () => {
    expect(await errorsFor({ category: 'x'.repeat(51) })).toContain('category');
    expect(await errorsFor({ category: 'x'.repeat(50) })).toEqual([]);
  });
});
