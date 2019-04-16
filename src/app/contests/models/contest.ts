export interface Contest {
    id: string;
    admins: string[];
    categories: string[];
    name: string;
    newCategorie: string;
}

export const emptyContest: Contest = {
    admins: [],
    categories: [],
    name: '',
    id: '',
    newCategorie: '',
};
