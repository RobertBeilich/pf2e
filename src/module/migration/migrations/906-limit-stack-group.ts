import { ItemSourcePF2e, isPhysicalData } from "@item/base/data/index.ts";
import { AMMO_STACK_GROUPS } from "@item/consumable/values.ts";
import { itemIsOfType } from "@item/helpers.ts";
import { setHasElement } from "@util";
import { MigrationBase } from "../base.ts";

/** Limit `stackGroup` property to consumables and treasure */
export class Migration906LimitStackGroup extends MigrationBase {
    static override version = 0.906;

    override async updateItem(source: MaybeWithToBeDeletedStackGroup): Promise<void> {
        const toDelete = !isPhysicalData(source) || !itemIsOfType(source, "consumable", "treasure");
        if (toDelete && "stackGroup" in source.system) {
            source.system["-=stackGroup"] = null;
        } else if (source.type === "consumable") {
            source.system.stackGroup =
                source.system.consumableType.value === "ammo" &&
                setHasElement(AMMO_STACK_GROUPS, source.system.stackGroup)
                    ? source.system.stackGroup
                    : null;
        } else if (source.type === "treasure") {
            source.system.stackGroup = ["coins", "gems"].includes(source.system.stackGroup ?? "")
                ? source.system.stackGroup
                : null;
        }
    }
}

type MaybeWithToBeDeletedStackGroup = ItemSourcePF2e & { system: { "-=stackGroup"?: null } };
