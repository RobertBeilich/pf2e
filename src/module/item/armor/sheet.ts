import { ItemSheetOptions } from "@item/base/sheet/sheet.ts";
import {
    CoinsPF2e,
    MATERIAL_DATA,
    MaterialSheetData,
    PhysicalItemSheetData,
    PhysicalItemSheetPF2e,
    RUNE_DATA,
    getPropertyRuneSlots,
} from "@item/physical/index.ts";
import { SheetOptions, createSheetTags } from "@module/sheet/helpers.ts";
import * as R from "remeda";
import type { ArmorCategory, ArmorGroup, ArmorPF2e, BaseArmorType, SpecificArmorData } from "./index.ts";

class ArmorSheetPF2e extends PhysicalItemSheetPF2e<ArmorPF2e> {
    override async getData(options?: Partial<ItemSheetOptions>): Promise<ArmorSheetData> {
        const sheetData = await super.getData(options);
        const armor = this.item;

        const adjustedBulkHint = armor.isEquipped || !armor.actor ? null : "PF2E.Item.Armor.UnequippedHint";

        // Armor property runes
        const maxPropertySlots = getPropertyRuneSlots(armor);
        const propertyRuneSlots: Record<`propertyRuneSlots${number}`, boolean> = {};
        for (const slot of [1, 2, 3, 4]) {
            if (slot <= maxPropertySlots) {
                propertyRuneSlots[`propertyRuneSlots${slot}`] = true;
            }
        }

        const specificMagicData = armor._source.system.specific ?? R.pick(armor._source.system, ["material", "runes"]);

        return {
            ...sheetData,
            adjustedBulkHint,
            basePrice: new CoinsPF2e(armor._source.system.price.value),
            baseTypes: CONFIG.PF2E.baseArmorTypes,
            categories: CONFIG.PF2E.armorCategories,
            groups: CONFIG.PF2E.armorGroups,
            otherTags: createSheetTags(CONFIG.PF2E.otherArmorTags, sheetData.data.traits.otherTags),
            preciousMaterials: this.getMaterialSheetData(armor, MATERIAL_DATA.armor),
            runeTypes: RUNE_DATA.armor,
            specificMagicData,
        };
    }

    protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        if (formData["system.acBonus"] === null) {
            formData["system.acBonus"] = 0;
        }

        const propertyRuneIndices = [0, 1, 2, 3] as const;
        const propertyRuneUpdates = propertyRuneIndices.flatMap((i) => formData[`system.runes.property.${i}`] ?? []);
        if (propertyRuneUpdates.length > 0) {
            formData[`system.runes.property`] = R.compact(propertyRuneUpdates);
            for (const index of propertyRuneIndices) {
                delete formData[`system.runes.property.${index}`];
            }
        }

        return super._updateObject(event, formData);
    }
}

interface ArmorSheetData extends PhysicalItemSheetData<ArmorPF2e> {
    basePrice: CoinsPF2e;
    baseTypes: Record<BaseArmorType, string>;
    categories: Record<ArmorCategory, string>;
    groups: Record<ArmorGroup, string>;
    otherTags: SheetOptions;
    preciousMaterials: MaterialSheetData;
    runeTypes: typeof RUNE_DATA.armor;
    specificMagicData: SpecificArmorData;
}

export { ArmorSheetPF2e };
