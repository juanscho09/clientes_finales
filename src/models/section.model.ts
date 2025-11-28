// ...existing code...
import { Policy } from "./policy.model";

export class Section {

    constructor(
        public name: string | null = null,
        public icon: string | null = null,
        public className: string | null = null,
        public policies: Policy[] | null = null
    ) { }

    public static createCollection(policies: Policy[]): Section[] {
        const allSections = (policies || []).map(x => x.section ?? '');
        const uniqueSections = allSections.filter((item, pos) => allSections.indexOf(item) === pos);

        const sections: Section[] = [];

        for (const item of uniqueSections) {
            if (!item) continue;
            const section = new Section();
            section.name = item;
            section.icon = 'car';
            section.className = '';
            section.policies = policies.filter(policy => policy.section === item);
            sections.push(section);
        }

        return sections;
    }
}