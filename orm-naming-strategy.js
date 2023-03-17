const { DefaultNamingStrategy } = require("typeorm");

class CamapNamingStrategy extends DefaultNamingStrategy {
  getTableName(tableOrName) {
    if (tableOrName.name) {
      return tableOrName.name;
    }
    return tableOrName.split(".").pop();
  }

  foreignKeyName(
    tableOrName,
    columnNames,
    referencedTablePath,
    referencedColumnNames
  ) {
    if (tableOrName === "WaitingList") {
      if (referencedTablePath === "Group") {
        return `${tableOrName}_group`;
      }
    }
    if (tableOrName === "WConfig") {
      if (
        columnNames[0] === "contract1Id" &&
        referencedTablePath === "Catalog"
      ) {
        return `${tableOrName}_contract`;
      }
    }
    if (tableOrName === "Catalog") {
      if (columnNames[0] === "userId" && referencedTablePath === "User") {
        return `${tableOrName}_contact`;
      }
    }
    if (tableOrName === "Error") {
      if (columnNames[0] === "uid" && referencedTablePath === "User") {
        // console.log("--", columnNames, referencedTablePath, referencedColumnNames)
        return `${tableOrName}_user`;
      }
    }
    if (tableOrName === "Session") {
      if (columnNames[0] === "uid" && referencedTablePath === "User") {
        // console.log("--", columnNames, referencedTablePath, referencedColumnNames)
        return `${tableOrName}_user`;
      }
    }
    if (tableOrName === "Group") {
      if (columnNames[0] === "userId" && referencedTablePath === "User") {
        return `${tableOrName}_contact`;
      }
      if (columnNames[0] === "placeId" && referencedTablePath === "Place") {
        return `${tableOrName}_mainPlace`;
      }
      if (columnNames[0] === "legalReprId" && referencedTablePath === "User") {
        return `${tableOrName}_legalRepresentative`;
      }
    }

    // console.log('--', columnNames, referencedTablePath, referencedColumnNames);

    return `${tableOrName}_${columnNames[0].replace("Id", "")}`;
  }
}

module.exports = CamapNamingStrategy;
