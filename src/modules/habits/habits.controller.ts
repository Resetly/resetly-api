import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { HabitsService } from './habits.service';
import { CreateHabitDto, UpdateHabitDto, HabitResponseDto } from './dto';

@ApiTags('habits')
@ApiBearerAuth()
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new habit for the authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'The habit has been successfully created.',
    type: HabitResponseDto,
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHabitDto,
  ): Promise<HabitResponseDto> {
    return this.habitsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all habits for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of habits belonging to the current user.',
    type: [HabitResponseDto],
  })
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<HabitResponseDto[]> {
    return this.habitsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific habit by ID' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiResponse({
    status: 200,
    description: 'Habit details.',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found.',
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<HabitResponseDto> {
    return this.habitsService.findById(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit by ID' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiResponse({
    status: 200,
    description: 'The updated habit.',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found.',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<HabitResponseDto> {
    return this.habitsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a habit by ID' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiResponse({
    status: 204,
    description: 'The habit was successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found.',
  })
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    return this.habitsService.delete(user.userId, id);
  }
}
