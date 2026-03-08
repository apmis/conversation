import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagService } from '../services/tag.service';
import {
  CreateTagDto,
  UpdateTagDto,
  EnsureTagsDto,
} from './dto/tag.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @Post('ensure')
  ensure(@Body() dto: EnsureTagsDto) {
    return this.tagService.ensureTagsExist(dto.tags);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}