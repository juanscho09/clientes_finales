// ...existing code...
export class News {
    constructor(
        public id: number = 0,
        public title: string | null = null,
        public description: string | null = null,
        public startDate: Date | null = null,
        public finalDate: Date | null = null,
        public readAt: Date | null = null,
        public link: string | null = null,
        public isBirthdayMessage: boolean = false,
        public isLink: boolean = false
    ) {
    }

    private static parseDate(value: any): Date | null {
        if (!value) return null;
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    public static create(object: any): News {
        const news = new News();
        news.id = object?.Id ?? 0;
        news.title = object?.Title ?? null;
        news.description = object?.Description ?? null;
        news.startDate = this.parseDate(object?.StartDate);
        news.finalDate = this.parseDate(object?.FinalDate);
        news.readAt = this.parseDate(object?.ReadAt);
        news.link = object?.Link ?? '';
        // backend puede enviar 1/0 o boolean
        news.isLink = object?.IsLink === 1 || object?.IsLink === true;
        news.isBirthdayMessage = object?.IsBirthdayMsg === 1 || object?.IsBirthdayMsg === true;
        return news;
    }

    public static createCollection(objectsCollection: any): News[] {
        const result: News[] = [];
        if (!objectsCollection) return result;
        for (const object of objectsCollection) {
            result.push(this.create(object));
        }
        return result;
    }
}