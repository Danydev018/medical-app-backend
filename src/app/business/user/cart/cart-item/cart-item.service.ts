import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { BranchMedicinesService } from 'src/app/business/medicine/branch-medicines/branch-medicines.service';
import { PrismaService } from '@/common/database/prisma.service';

@Injectable()
export class CartItemService {
  constructor(
    private branchMedicineService: BranchMedicinesService,
    private prismaService: PrismaService
  ) { }

  async create(createCartItemDto: CreateCartItemDto, cartId: number) {
    const { medicineId, quantity, branchId } = createCartItemDto;

    const branchMedicine = await this.branchMedicineService.findOneMedicineByBranchId(branchId, medicineId);

    if (!branchMedicine) {
      throw new NotFoundException('Medicine not found or not available in this branch');
    }

    if (branchMedicine.quantity < quantity) {
      throw new NotFoundException('Medicine stock is not enough');
    }

    const cartItem = await this.prismaService.cartItem.create({
      data: {
        quantity: quantity,
        cart: {
          connect: {
            id: cartId
          }
        },
        medicine: {
          connect: {
            id: medicineId
          }
        }
      }
    });

    return cartItem;
  }

  async findAll(cartId: number) {
    return await this.prismaService.cartItem.findMany({
      where: {
        cart: {
          id: cartId
        }
      },
      include: {
        medicine: true,
      }
    });
  }

  async findOne(id: number) {
    return await this.prismaService.cartItem.findUnique({
      where: {
        id: id
      },
      include: {
        medicine: true,
        cart: true
      }
    });
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto) {
    return await this.prismaService.cartItem.update({
      where: {
        id: id
      },
      data: updateCartItemDto
    });
  }

  async remove(id: number) {
    return await this.prismaService.cartItem.delete({
      where: {
        id: id
      }
    });
  }
}
