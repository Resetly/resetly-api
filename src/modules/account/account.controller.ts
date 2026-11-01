import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { AccountService } from './account.service';
import { AccountDeletionResponseDto } from './dto/account.dto';

@ApiTags('account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete user account and all cascaded data' })
  @ApiResponse({
    status: 200,
    description: 'Account and all data successfully erased',
    type: AccountDeletionResponseDto,
  })
  async deleteAccount(@CurrentUser() user: AuthenticatedUser): Promise<AccountDeletionResponseDto> {
    return this.accountService.deleteAccount(user.userId);
  }
}
