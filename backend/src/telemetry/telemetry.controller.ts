import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TelemetryService } from './telemetry.service.js';
import { CreateTelemetryDto } from './dto/create-telemetry.dto.js';
import { UpdateTelemetryDto } from './dto/update-telemetry.dto.js';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  create(@Body() createTelemetryDto: CreateTelemetryDto) {
    return this.telemetryService.create(createTelemetryDto);
  }

  @Get()
  findAll() {
    return this.telemetryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telemetryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTelemetryDto: UpdateTelemetryDto) {
    return this.telemetryService.update(+id, updateTelemetryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telemetryService.remove(+id);
  }
}
