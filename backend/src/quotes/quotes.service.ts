import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) { }

  async create(createQuoteDto: CreateQuoteDto) {
    const { stages, indirectCosts, ...quoteData } = createQuoteDto;

    return this.prisma.quote.create({
      data: {
        ...quoteData,
        stages: {
          create: stages?.map(stage => ({
            name: stage.name,
            description: stage.description,
            items: {
              create: stage.items?.map(item => ({
                description: item.description,
                unit: item.unit,
                quantity: item.quantity,
                unitCost: item.unitCost,
              })) || []
            }
          })) || []
        },
        indirectCosts: {
          create: indirectCosts?.map(ic => ({
            description: ic.description,
            amount: ic.amount
          })) || []
        }
      },
      include: {
        customer: true,
        stages: { include: { items: true } },
        indirectCosts: true
      }
    });
  }

  async findAll() {
    return this.prisma.quote.findMany({
      include: {
        customer: true,
        stages: { include: { items: true } },
        indirectCosts: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        stages: { include: { items: true } },
        indirectCosts: true
      }
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto) {
    const { stages, indirectCosts, ...quoteData } = updateQuoteDto;

    // To handle complex nested updates safely, we delete existing and recreate
    // Only if stages or indirectCosts are provided in the payload
    if (stages !== undefined) {
      await this.prisma.quoteStage.deleteMany({ where: { quoteId: id } });
    }
    if (indirectCosts !== undefined) {
      await this.prisma.quoteIndirectCost.deleteMany({ where: { quoteId: id } });
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...quoteData,
        ...(stages !== undefined && {
          stages: {
            create: stages.map(stage => ({
              name: stage.name,
              description: stage.description,
              items: {
                create: stage.items?.map(item => ({
                  description: item.description,
                  unit: item.unit,
                  quantity: item.quantity,
                  unitCost: item.unitCost,
                })) || []
              }
            }))
          }
        }),
        ...(indirectCosts !== undefined && {
          indirectCosts: {
            create: indirectCosts.map(ic => ({
              description: ic.description,
              amount: ic.amount
            }))
          }
        })
      },
      include: {
        customer: true,
        stages: { include: { items: true } },
        indirectCosts: true
      }
    });
  }

  async remove(id: number) {
    return this.prisma.quote.delete({ where: { id } });
  }

  async duplicate(id: number) {
    const quote = await this.findOne(id);
    const newQuoteDto: CreateQuoteDto = {
      title: quote.title + ' (Cópia)',
      customerId: quote.customerId || undefined,
      address: quote.address || undefined,
      city: quote.city || undefined,
      type: quote.type,
      totalArea: quote.totalArea ? Number(quote.totalArea) : undefined,
      responsible: quote.responsible || undefined,
      paymentTerms: quote.paymentTerms || undefined,
      estimatedTime: quote.estimatedTime || undefined,
      includedItems: quote.includedItems || undefined,
      excludedItems: quote.excludedItems || undefined,
      validityDays: quote.validityDays || undefined,
      marginPercentage: quote.marginPercentage ? Number(quote.marginPercentage) : undefined,
      status: 'DRAFT',
      stages: quote.stages.map(s => ({
        name: s.name,
        description: s.description || undefined,
        items: s.items.map(i => ({
          description: i.description,
          unit: i.unit,
          quantity: Number(i.quantity),
          unitCost: Number(i.unitCost)
        }))
      })),
      indirectCosts: quote.indirectCosts.map(ic => ({
        description: ic.description,
        amount: Number(ic.amount)
      }))
    };
    return this.create(newQuoteDto);
  }

  async convertToProject(id: number) {
    const quote = await this.findOne(id);

    // Calculate total quote value logic to put into salesValue
    let totalItems = 0;
    quote.stages.forEach(s => s.items.forEach(i => {
      totalItems += (Number(i.quantity) * Number(i.unitCost));
    }));
    const indirectTotal = quote.indirectCosts.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const subtotal = totalItems + indirectTotal;
    const margin = quote.marginPercentage ? Number(quote.marginPercentage) : 0;
    const finalPrice = subtotal * (1 + (margin / 100));

    const newProject = await this.prisma.project.create({
      data: {
        name: quote.title,
        customerId: quote.customerId,
        city: quote.city,
        location: quote.address,
        totalArea: quote.totalArea,
        salesValue: finalPrice,
        status: 'ACTIVE',
        stages: {
          create: quote.stages.map(s => ({
            name: s.name,
            status: 'PENDING',
            startDatePlanned: new Date(),
            endDatePlanned: new Date()
          }))
        },
        budgets: {
          create: {
            category: 'SERVIÇOS',
            amount: subtotal,
            description: 'Orçamento Importado'
          }
        }
      }
    });

    // Update quote status
    await this.prisma.quote.update({ where: { id }, data: { status: 'APPROVED' } });
    return newProject;
  }
}
