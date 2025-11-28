// ...existing code...
export class Policy {

    static readonly CAR = 'automotores';
    static readonly VARIOUSRISKS = 'riesgos varios';

    constructor(
        public id: number = 0,
        public name: string | null = null,
        public checkbookName: string | null = null,
        public endoso: number | null = 0,
        public fromDate: string | null = null,
        public toDate: string | null = null,
        public company: string | null = null,
        public section: string | null = null,
        public phone: string | null = null,
        public detail: string | null = null,
        public exists: boolean = false,
        public endpoint: string | null = null,
        public checkbookEndpoint: string | null = null,
        public downloaded: boolean = false
    ) { }

    public static create(object: any): Policy {
        const policy = new Policy();
        policy.id = object?.poliza ?? 0;
        policy.name = object?.poliza_ruta_nombre ?? null;
        policy.checkbookName = object?.chequera_ruta_nombre ?? null;
        policy.endoso = object?.endoso ?? 0;
        policy.fromDate = object?.desde ?? null;
        policy.toDate = object?.hasta ?? null;
        policy.company = object?.compania ?? null;
        policy.section = object?.seccion ?? null;
        // phone puede venir como número o string
        policy.phone = object?.telefono != null ? String(object.telefono) : null;
        policy.detail = object?.detalle ?? null;
        policy.endpoint = object?.poliza_ruta ?? null;
        policy.checkbookEndpoint = object?.chequera_ruta ?? null;
        policy.exists = !!object?.poliza_existe;
        policy.downloaded = !!object?.downloaded;
        return policy;
    }

    public static createCollection(objectsCollection: any): Policy[] {
        const policies: Policy[] = [];
        if (!objectsCollection) return policies;
        for (const object of objectsCollection) {
            // soporta wrapper { data: [...] } o el array directamente
            if (object && (object.hasOwnProperty('poliza') || object.poliza != null)) {
                policies.push(this.create(object));
            } else if (object && typeof object === 'object' && Array.isArray(object)) {
                // improbable, pero por seguridad:
                for (const o of object) {
                    if (o?.poliza != null) policies.push(this.create(o));
                }
            } else {
                // si el backend envía un array bajo .data, lo maneja quien llama
            }
        }
        return policies;
    }
}