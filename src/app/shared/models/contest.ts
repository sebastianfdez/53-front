export class Contest {
    id: string;
    admins: string[];
    categories: string[];
    name: string;
    judges: string[];
    speaker: string;
    type: string;
}

export const emptyContest: Contest = {
    admins: [],
    categories: [],
    name: '',
    id: '',
    judges: [],
    speaker: '',
    type: '',
};
