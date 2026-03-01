import { removeSpaces } from "@utils/fomat/string";
import { removeAccents } from "@utils/fomat/string";

export function getCid(fileName: string): string {
    return removeSpaces(removeAccents(fileName));
}