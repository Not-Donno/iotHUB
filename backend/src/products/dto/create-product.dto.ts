import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ProductStatus } from '../entities/products.entity.js';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // free text, folded to trimmed lowercase so "Sensors" and "sensors" are one
  // filter; '' means uncategorised, same as leaving it out
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(50)
  category?: string;

  // empty string clears the image, so it is excluded from URL validation
  // instead of failing it; require_tld: false so localhost dev URLs work
  @ValidateIf(
    (product: CreateProductDto) =>
      product.image_url !== undefined && product.image_url !== '',
  )
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  @MaxLength(500)
  image_url?: string;

  // the column is numeric(10,2): pg hands numeric back as a string, so @Type
  // coerces the body to a real number before the entity transformer sees it
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
