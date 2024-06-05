export enum Unit {
  Piece,
  Kilogram,
  Gram,
  Litre,
  Centilitre,
  Millilitre,
}

/**
 * Stock tracking rule to use.
 */
export enum StockTracking {
  /**
   * Always availabled.
   */
  Disabled,

  /**
   * A global initial stock that won't change for this Catalog
   */
  Global,

  /**
   * A per distribution stock.
   * @see StockTrackingPerDistribution
   */
  PerDistribution
}

/**
 * if "stockTracking" is "PerDistribution", stockTrackingPerDistrib is the rule to use.
 */
export enum StockTrackingPerDistribution {
  /**
   * initial stock is the same for each distribution
   */
  AlwaysTheSame,

  /**
   * initial stock exists at regular intervals. oe: 1 times out of 3 there is stock. Else, 0.
   */
  Intervals,

  /**
   * initial stock configured per period (continuous group of distribs) for multiple periods.
   * @see ProductDistributionStock
   */
  PerPeriod
}