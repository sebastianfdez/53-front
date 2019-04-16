export interface Contest {
    id: string;
    admins: string[];
    categories: string[];
    name: string;
    newCategorie: string;
    judges: string[];
}

export const emptyContest: Contest = {
    admins: [],
    categories: [],
    name: '',
    id: '',
    newCategorie: '',
    judges: [],
};
