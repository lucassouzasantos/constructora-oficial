import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
        const payload = { email: user.email, sub: user.id, role: user.role, tenantId: user.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            user: { ...user, tenantName: tenant?.name },
        };
    }

    async signup(companyName: string, email: string, password: string, name?: string) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new ConflictException('Email já está em uso');

        const tenant = await this.prisma.tenant.create({ data: { name: companyName } });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { email, password: hashedPassword, name, role: 'ADMIN', tenantId: tenant.id },
        });

        const { password: _pw, ...userWithoutPassword } = user;
        return this.login({ ...userWithoutPassword });
    }
}
