import { PartialType } from '@nestjs/mapped-types';
import { CreateTelemetryDto } from './create-telemetry.dto.js';

export class UpdateTelemetryDto extends PartialType(CreateTelemetryDto) {}
