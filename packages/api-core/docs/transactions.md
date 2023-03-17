# Transactions

Les transactions sont gérées grâce au paquet [typeorm-transactional-cls-hooked](https://github.com/odavid/typeorm-transactional-cls-hooked/) via le décorateur de méthode `Transactional`.

Par défaut, celui-ci, prends en charge une transaction en cours ou créez-en une nouvelle s'il n'en existe pas encore dans la requête.

`Transactional` doit décorer les mutations des `Resolver`s, les méthodes "`post`", "`put`" et "`delete`" des `Controller`s ainsi que toutes les méthodes des `Service`s réalisant des opérations d'écriture sur la base.

## Lock

## Usage

```TS
// orders.resolver

[...]

    @Transactional()
    @Mutation(() => Order)
    createOrder(@Args() input: CreateOrderInput) {
        return this.ordersService.create(input);
    }

[...]

```

```TS
// orders.service

[...]

    @Transactional()
    async create({ basket, ...orderInput}: CreateOrderInput) {
        const order = await this.productsRepo.save(input);
        await Promise.all([basket.map((basket) => {
            return this.productsService.decreaseStock(basket.productId, basket.quantity);
        })]);
        return order;
    }

[...]

```

```TS
// products.service

[...]

    findOneById(id: number, lock = false) {
        return this.productsRepo.findOne(id, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    })
    }

    @Transactional()
    await decreaseStock(productId: number, quantity: number) {
        const product = await this.findOneById(productId);
        product.quantity -= quantity;
        return this.productsRepo.save(product);
    }

[...]

```
