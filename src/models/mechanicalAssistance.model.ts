// ...existing code...
interface Item {
    number: string;
    numberToCall: string;
}

export class MechanicalAssistance {

    constructor(
        public company: string | null = null,
        public databaseCompany: string | null = null,
        public interior: Item[] = [],
        public exterior: Item[] = [],
        public whatsapp: Item[] = []
    ) { }

    public static create(object: any): MechanicalAssistance {
        const mechanicalAssistance = new MechanicalAssistance();
        mechanicalAssistance.company = object?.company ?? null;
        mechanicalAssistance.databaseCompany = object?.databaseCompany ?? null;
        mechanicalAssistance.interior = Array.isArray(object?.interior) ? object.interior : [];
        mechanicalAssistance.exterior = Array.isArray(object?.exterior) ? object.exterior : [];
        mechanicalAssistance.whatsapp = Array.isArray(object?.whatsapp) ? object.whatsapp : [];
        return mechanicalAssistance;
    }

    public static createCollection(objectsCollection: any): MechanicalAssistance[] {
        const mechanicalAssists: MechanicalAssistance[] = [];
        if (!objectsCollection) return mechanicalAssists;
        for (const object of objectsCollection) {
            mechanicalAssists.push(this.create(object));
        }
        return mechanicalAssists;
    }
}