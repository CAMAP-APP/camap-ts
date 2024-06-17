import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { BasketEntity } from '../../shop/entities/basket.entity';
import { UserOrderEntity } from '../../shop/entities/user-order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(UserOrderEntity)
    private readonly ordersRepo: Repository<UserOrderEntity>,
    @InjectRepository(BasketEntity)
    private readonly basketsRepo: Repository<BasketEntity>,
  ) {}

  findUserOrdersByProductIds(productIds: number[]) {
    return this.ordersRepo.find({ productId: In(productIds) });
  }

  findUserOrdersByDistributionIds(distributionIds: number[]) {
    return this.ordersRepo.find({ distributionId: In(distributionIds) });
  }

  async findPartialUserOrdersByUserId(
    userId: number,
  ): Promise<Pick<UserOrderEntity, 'id' | 'date'>[]> {
    return this.ordersRepo
      .createQueryBuilder('o')
      .select('o.id, o.date')
      .where(`o.userId = ${userId}`)
      .getRawMany();
  }

  async findPartialUserOrdersByUserId2(
    userId: number,
  ): Promise<Pick<UserOrderEntity, 'id' | 'date'>[]> {
    return this.ordersRepo
      .createQueryBuilder('o')
      .select('o.id, o.date')
      .where(`o.userId2 = ${userId}`)
      .getRawMany();
  }

  /**
   * On delete user
   * attach baskets to ghost user
   */
  @Transactional()
  async attributeBasketsToDeletedUser(userId: number, deleteUserId: number) {
    await Promise.all([
      this.ordersRepo.update(
        { userId: userId },
        {
          userId: deleteUserId,
        },
      ),
      this.ordersRepo.update(
        { userId2: userId },
        {
          userId2: deleteUserId,
        },
      ),
    ]);

    return this.basketsRepo.update(
      { userId },
      {
        userId: deleteUserId,
      },
    );
  }

  /**
   * Find orders that are not older than one month, belong to the userId, and related to the groupId
   * @param userId
   * @param groupId
   */
  async findRecentUserOrders(
    userId: number,
    groupId: number,
  ): Promise<Pick<UserOrderEntity, 'id'>[]> {
    return this.ordersRepo
      .createQueryBuilder('o')
      .select('o.id')
      .where(`o.userId2 = :userId OR o.userId = :userId`, { userId })
      .andWhere('o.date >= NOW() - INTERVAL 1 MONTH')
      // need to find the groupId via UserOrderEntity.product.catalog.group
      .innerJoin('o.product', 'p')
      .innerJoin('p.catalog', 'c')
      .innerJoin('c.group', 'g', 'g.id = :groupId', { groupId })
      .getRawMany();
  }
}
