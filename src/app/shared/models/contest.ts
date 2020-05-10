export class Contest {
    id: string;

    admins: string[];

    categories: string[];

    name: string;

    judges: string[];

    speaker: string;

    type: string;

    date: number;

    place: string;

    isPublic: boolean;
}

export const emptyContest: Contest = {
    admins: [],
    categories: [],
    name: '',
    id: '',
    judges: [],
    speaker: '',
    type: '',
    date: 0,
    place: '',
    isPublic: false,
};
