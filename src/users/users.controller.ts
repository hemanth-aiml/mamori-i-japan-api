import {
  Controller,
  Get,
  Request,
  UseGuards,
  UsePipes,
  UseInterceptors,
  ValidationPipe,
  Post,
  Body,
  HttpCode,
  Patch,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { FirebaseNormalUserValidateGuard } from '../auth/guards/firebase-normal-user-validate.guard'
import { VALIDATION_PIPE_OPTIONS } from '../constants/validation-pipe'
import { UpdateUserProfileDto } from './dto/create-user.dto'
import { CreateDiagnosisKeysForOrgDto } from './dto/create-diagnosis-keys.dto'
import { CreatedResponseInterceptor } from '../shared/interceptors/created-response.interceptor'
import { CreatedResponse } from '../shared/classes/created-response.class'
import { UserProfile } from './classes/user.class'

@ApiTags('app')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(FirebaseNormalUserValidateGuard)
@UseInterceptors(CreatedResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ type: UserProfile })
  @Get('/me/profile')
  async getMeProfile(@Request() req): Promise<UserProfile> {
    const userId = req.user.uid
    return this.usersService.findOneUserProfileById(userId)
  }

  @UsePipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({ type: CreatedResponse })
  @Patch('/me/profile')
  async patchMeProfile(
    @Request() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ): Promise<void> {
    updateUserProfileDto.userId = req.user.uid
    return this.usersService.updateUserProfile(updateUserProfileDto)
  }

  @UsePipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
  @ApiOperation({ summary: 'Give the user a positive flag by user-self' })
  @ApiOkResponse({ type: CreatedResponse })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Post('/me/diagnosis_keys_for_org')
  @HttpCode(200)
  async createDiagnosisKeysForOrg(
    @Request() req,
    @Body() createDiagnosisKeysForOrg: CreateDiagnosisKeysForOrgDto
  ): Promise<CreatedResponse> {
    createDiagnosisKeysForOrg.organizationCode = req.user.organizationCode
    await this.usersService.createDiagnosisKeysForOrg(createDiagnosisKeysForOrg)
    return {}
  }
}
