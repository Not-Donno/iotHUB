import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto.js';

// a valid body with only image_url varying — any other error would be a bug
// in the fixture, so the assertions can look at the full error list
const errorsFor = async (image_url?: unknown) => {
  const dto = plainToInstance(CreateProductDto, {
    name: 'Sensor',
    price: 10,
    ...(image_url === undefined ? {} : { image_url }),
  });
  return (await validate(dto)).map((error) => error.property);
};

describe('CreateProductDto image_url', () => {
  it('accepts an https URL', async () => {
    expect(await errorsFor('https://cdn.example.com/sensor.png')).toEqual([]);
  });

  it('accepts a localhost URL (no TLD)', async () => {
    expect(await errorsFor('http://localhost:3200/sensor.png')).toEqual([]);
  });

  it('accepts an empty string — the way a vendor clears the image', async () => {
    expect(await errorsFor('')).toEqual([]);
  });

  it('accepts the field being absent', async () => {
    expect(await errorsFor()).toEqual([]);
  });

  it('rejects a non-URL', async () => {
    expect(await errorsFor('not a url')).toContain('image_url');
  });

  it('rejects a non-http(s) scheme', async () => {
    expect(await errorsFor('javascript:alert(1)')).toContain('image_url');
  });

  it('rejects a URL longer than 500 chars', async () => {
    expect(await errorsFor(`https://example.com/${'a'.repeat(500)}`)).toContain(
      'image_url',
    );
  });
});
