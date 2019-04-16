export interface Votes {
    codeParticipant: string;
    codeJuge: string;
    nameJuge: string;
    note: number;
}

export interface Participant {
    name: string;
    lastName: string;
    licence: string;
    votes: Votes[];
    club: string;
    id: string;
}

export const emptyParticipant: Participant = {
    name: '',
    lastName: '',
    licence: '',
    votes: [],
    club: '',
    id: '',
};

export interface Pool {
    participants: Participant[];
}

export interface Categorie {
    contest: string;
    name: string;
    pools: { participants: string[] }[];
    id: string;
}

export interface CategoriePopulated {
    contest: string;
    num: number;
    name: string;
    pools: { participants: Participant[] }[];
    id: string;
}

export const emptyCategorie: Categorie = {
    name: '',
    pools: [],
    id: '',
    contest: '',
};

export interface Judge {
    name: string;
    code: string;
}
