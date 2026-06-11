import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
        await this.seedMasterAdmin();
    }

    private async seedMasterAdmin() {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@construtora.com';
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.warn('[AVISO] ADMIN_PASSWORD não definido. Seed de admin ignorado. Defina ADMIN_PASSWORD no .env para criar o usuário administrador inicial.');
            return;
        }

        const existingAdmin = await this.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await this.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Administrador',
                    role: 'ADMIN'
                }
            });
            console.log(`Usuário ADMIN criado: ${adminEmail}`);
        } else if (existingAdmin.role !== 'ADMIN') {
            await this.user.update({
                where: { email: adminEmail },
                data: { role: 'ADMIN' }
            });
            console.log('Role ADMIN restaurada para o usuário administrador.');
        }
    }
}
