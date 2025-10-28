import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { AuthorService } from './services/author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorQueryDto } from './dto/author-query.dto';

@Controller({
  path: 'authors',
})
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: AuthorQueryDto) {
    return this.authorService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('withBooks', new ParseBoolPipe({ optional: true })) withBooks?: boolean,
  ) {
    return this.authorService.findOne(id, withBooks);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.authorService.remove(id);
  }
}
