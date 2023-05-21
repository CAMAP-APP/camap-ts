import { formatSmartQt } from "./format";
import { Unit } from "./interfaces";

describe("formatSmartQt", () => {
  it("formatSmartQt", () => {
    expect(
      formatSmartQt(
        {
          name: "fromage",
          qt: 100,
          unitType: Unit.Gram,
          bulk: false,
          variablePrice: true,
          wholesale: false,
        },
        { quantity: 2 }
      )
    ).toBe("200g. fromage");

    expect(
      formatSmartQt(
        {
          name: "poulet",
          qt: 1,
          unitType: Unit.Piece,
          bulk: false,
          variablePrice: true,
          wholesale: false,
        },
        { quantity: 2 }
      )
    ).toBe("2 poulet");

    expect(
      formatSmartQt(
        {
          name: "yahourt",
          qt: 50,
          unitType: Unit.Gram,
          bulk: false,
          variablePrice: false,
          wholesale: false,
        },
        { quantity: 12 }
      )
    ).toBe("12 x yahourt 50g.");
  });
});
