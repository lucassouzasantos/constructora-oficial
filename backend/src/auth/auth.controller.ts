import { Controller, Request, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Public()
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @Post('signup')
    async signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto.companyName, dto.email, dto.password, dto.name);
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
